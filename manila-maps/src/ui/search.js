// Full-screen search: instant results as you type, quick category chips, recents.
import { svg } from '../assets/icons.js';
import { html, esc, debounce } from './dom.js';
import { CHIPS, resultRow, categorySearch } from './places.js';
import { getRecents, addRecent } from './recents.js';
import { Back } from './back.js';
import { tap } from '../nav/device.js';

const PLACEHOLDER = { go: 'Where to?', from: 'Choose starting point', to: 'Choose destination' };

export function openSearch(app, { purpose = 'go', chip = null, onPick, query = '' }) {
  const el = html(`
    <div class="search-screen" role="dialog" aria-label="Search">
      <div class="search-head">
        <button class="icon-btn" data-a="back" aria-label="Back">${svg('back', { size: 22 })}</button>
        <div class="search-field">
          ${svg('search', { size: 18 })}
          <input type="search" enterkeyhint="search" autocomplete="off" autocorrect="off" spellcheck="false" placeholder="${PLACEHOLDER[purpose] || 'Search'}" />
          <button class="icon-btn small" data-a="clear" aria-label="Clear" hidden>${svg('close', { size: 16 })}</button>
        </div>
      </div>
      <div class="search-body"></div>
    </div>`);
  app.root.appendChild(el);
  const input = el.querySelector('input');
  const body = el.querySelector('.search-body');
  const clearBtn = el.querySelector('[data-a="clear"]');
  let rows = [];
  let activeChip = chip;
  let closed = false;

  const close = () => {
    if (closed) return;
    closed = true;
    Back.pop(close);
    input.blur();
    el.classList.remove('show');
    setTimeout(() => el.remove(), 220);
  };
  Back.push(close);

  const pick = (p) => {
    tap();
    if (!p.isMyLocation) addRecent(p);
    close();
    onPick?.(p);
  };

  const renderList = (list, { header = '', iconFor = null } = {}) => {
    rows = list;
    const my = app.myPos();
    body.innerHTML = `${header}<ul class="list">${list.map((p, i) => resultRow(p, my, { i, icon: iconFor?.(p) })).join('')}</ul>`;
  };

  const renderIdle = () => {
    activeChip = null;
    const parts = [];
    const extra = [];
    const me = app.myLocationPlace();
    if (purpose !== 'go' && me) extra.push(me);
    const recents = getRecents();
    rows = [...extra, ...recents];
    const my = app.myPos();
    if (purpose === 'go') {
      parts.push(`<div class="chips wrap">${CHIPS.map((c) => `<button class="chip" data-chip="${c.id}">${svg(c.icon, { size: 16 })}<span>${c.label}</span></button>`).join('')}</div>`);
    }
    if (purpose === 'from' && !me) parts.push(`<p class="search-note">${svg('info', { size: 16 })}<span>Your location isn’t available right now. Search for a starting point.</span></p>`);
    if (extra.length) parts.push(`<ul class="list">${extra.map((p, i) => resultRow(p, my, { i })).join('')}</ul>`);
    if (recents.length) {
      parts.push(`<div class="section-head"><h3>Recent</h3></div><ul class="list">${recents.map((p, i) => resultRow(p, my, { i: i + extra.length, icon: 'clock' })).join('')}</ul>`);
    } else if (!extra.length) {
      parts.push(`<div class="empty-hint">${svg('search', { size: 22 })}<p>Try “SM Megamall”, “Ayala Ave”, “Brgy San Lorenzo” or “hospital”.</p></div>`);
    }
    body.innerHTML = parts.join('');
  };

  const message = (title, text = '') => {
    rows = [];
    body.innerHTML = `<div class="empty-hint">${svg('search', { size: 22 })}<p><b>${esc(title)}</b>${text ? `<br>${esc(text)}` : ''}</p></div>`;
  };

  const runChip = async (c) => {
    activeChip = c;
    input.value = '';
    clearBtn.hidden = true;
    message(`Finding ${c.label.toLowerCase()} near you…`);
    await app.engines.searchReady;
    if (closed || activeChip !== c) return;
    const near = app.nearPoint();
    const list = categorySearch({ chip: c, search: app.engines.search, map: app.map, near });
    if (!list.length) return message(`No ${c.label.toLowerCase()} found nearby`, 'Zoom the map to the area you want and try again.');
    renderList(list, { header: `<div class="section-head"><h3>${esc(c.label)} ${app.myPos() ? 'near you' : 'nearby'}</h3></div>` });
  };

  let searchSeq = 0;
  const runQuery = async () => {
    const q = input.value.trim();
    clearBtn.hidden = !q;
    if (!q) return renderIdle();
    activeChip = null;
    const seq = ++searchSeq;
    if (!app.engines.search) {
      message('Loading search…');
      await app.engines.searchReady;
      if (seq !== searchSeq || closed) return;
      if (!app.engines.search) return message('Search isn’t available', 'This map file has no search index yet.');
    }
    let list = [];
    try { list = app.engines.search.search(q, { near: app.nearPoint(), limit: 25 }) || []; } catch (e) { console.warn(e); }
    if (seq !== searchSeq) return;
    if (!list.length) return message(`No results for “${q}”`, 'Check the spelling or try a nearby street or landmark.');
    renderList(list);
  };
  const debounced = debounce(runQuery, 70);

  input.addEventListener('input', debounced);
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') { e.preventDefault(); runQuery(); input.blur(); }
  });
  el.querySelector('[data-a="back"]').addEventListener('click', close);
  clearBtn.addEventListener('click', () => { input.value = ''; runQuery(); input.focus(); });
  body.addEventListener('click', (e) => {
    const c = e.target.closest('[data-chip]');
    if (c) { tap(); runChip(CHIPS.find((x) => x.id === c.dataset.chip)); return; }
    const r = e.target.closest('[data-i]');
    if (r && rows[Number(r.dataset.i)]) pick(rows[Number(r.dataset.i)]);
  });
  // Hide the keyboard while scrolling results.
  body.addEventListener('touchstart', () => { if (document.activeElement === input) input.blur(); }, { passive: true });

  requestAnimationFrame(() => el.classList.add('show'));
  if (chip) runChip(chip);
  else {
    input.value = query;
    // Focus inside the tap gesture so the on-screen keyboard opens.
    input.focus({ preventScroll: true });
    runQuery();
  }
  return { close };
}
