// Settings & map data: installed map info, backup / import / update, voice, about.
import { svg, logoSvg } from '../assets/icons.js';
import { html, esc, fmtBytes, fmtDate } from './dom.js';
import { MapStore } from '../core/mapstore.js';
import { Back } from './back.js';
import { confirmDialog, toast } from './feedback.js';
import { Voice, tap } from '../nav/device.js';
import { version as APP_VERSION } from '../../package.json';

const PHASE = { copy: 'Copying', download: 'Downloading', verify: 'Verifying', install: 'Installing' };

export function openSettings(app) {
  const m = app.bundle.manifest;
  const el = html(`
    <div class="modal-backdrop">
      <section class="modal-sheet" role="dialog" aria-label="Settings and map data">
        <div class="modal-grab"><div class="sheet-handle"></div></div>
        <header class="modal-head">
          <div class="brand-row">${logoSvg(40)}<div><h2>Manila Maps</h2><p>by Chester Studio</p></div></div>
          <button class="icon-btn" data-a="close" aria-label="Close">${svg('close', { size: 20 })}</button>
        </header>
        <div class="modal-body">
          <h3 class="group-title">Offline map</h3>
          <div class="card map-card">
            <div class="map-card-head">
              <span class="ricon" style="--ic:#0B9E6A">${svg('layers', { size: 20 })}</span>
              <div><b class="mc-title">${esc(m.title || 'Metro Manila')}</b><span class="mc-id">${esc(m.id || '')}</span></div>
              <span class="badge ok">${svg('check', { size: 14 })}Installed</span>
            </div>
            <dl class="kv">
              <dt>OpenStreetMap data</dt><dd>${esc(fmtDate(m.osmTimestamp))}</dd>
              <dt>Size</dt><dd class="v-size">…</dd>
              <dt>Stored in</dt><dd class="v-loc">…</dd>
            </dl>
            <p class="note">${svg('storage', { size: 16 })}<span>Your map is stored permanently on this phone and is never deleted automatically.</span></p>
          </div>

          <div class="progress-box" hidden>
            <div class="progress"><div class="progress-bar"></div></div>
            <p class="progress-msg"></p>
          </div>
          <p class="result-msg" hidden></p>

          <div class="action-list">
            <button class="action" data-a="export">${svg('download', { size: 20 })}<span><b>Save backup to Files</b><small>Keep a copy of the map file, e.g. to share it to another phone</small></span></button>
            <button class="action" data-a="import">${svg('upload', { size: 20 })}<span><b>Import from Files</b><small>Install a .mmap map file you already have</small></span></button>
            <button class="action" data-a="update">${svg('refresh', { size: 20 })}<span><b>Update map</b><small>Download the latest map (about 100 MB)</small></span></button>
          </div>

          <h3 class="group-title">Navigation</h3>
          <div class="card">
            <label class="toggle-row"><span><b>Voice prompts</b><small>Spoken turn-by-turn directions (uses your phone’s offline voice)</small></span><input type="checkbox" data-t="voice"><i></i></label>
            <label class="toggle-row"><span><b>Simulate drive</b><small>For testing: Start drives along the route without GPS</small></span><input type="checkbox" data-t="sim"><i></i></label>
          </div>

          <details class="advanced">
            <summary>Advanced</summary>
            <label class="field"><span>Update source</span><input type="url" data-t="url" spellcheck="false" autocomplete="off"></label>
          </details>

          <h3 class="group-title">About</h3>
          <div class="card about">
            <p>Manila Maps works 100% offline: map, search and directions all run on this phone.</p>
            <p class="attr">Map data © OpenStreetMap contributors (ODbL)</p>
            <p class="muted">Manila Maps by Chester Studio · ${MapStore.platform === 'android' ? 'Android' : 'Web'} · v${APP_VERSION}</p>
          </div>
        </div>
      </section>
    </div>`);
  app.root.appendChild(el);
  const $ = (s) => el.querySelector(s);
  const progBox = $('.progress-box');
  const progBar = progBox.querySelector('.progress-bar');
  const progMsg = $('.progress-msg');
  const result = $('.result-msg');
  let busy = false;

  const close = () => {
    if (busy) { toast('Please wait until the map operation finishes.'); return; }
    Back.pop(close);
    el.classList.remove('show');
    setTimeout(() => el.remove(), 250);
  };
  Back.push(close);
  requestAnimationFrame(() => el.classList.add('show'));

  MapStore.status().then((s) => {
    $('.v-size').textContent = fmtBytes(s.sizeBytes || app.bundle.reader?.size);
    $('.v-loc').textContent = s.location || (MapStore.platform === 'android' ? 'App storage' : 'Browser storage');
  }).catch(() => {
    $('.v-size').textContent = fmtBytes(app.bundle.reader?.size);
    $('.v-loc').textContent = '—';
  });

  const onProgress = (p) => {
    progBox.hidden = false;
    const pct = p?.total ? Math.floor((p.loaded / p.total) * 100) : null;
    progMsg.textContent = `${PHASE[p?.phase] || 'Working'}…${pct != null ? ` ${pct}%` : ''}${p?.total ? ` of ${fmtBytes(p.total)}` : ''}`;
    progBar.parentElement.classList.toggle('indeterminate', pct == null);
    if (pct != null) progBar.style.width = `${pct}%`;
  };
  const showResult = (text, kind = '') => {
    result.textContent = text;
    result.className = `result-msg ${kind}`;
    result.hidden = false;
  };
  const setBusy = (b) => {
    busy = b;
    for (const btn of el.querySelectorAll('.action')) btn.disabled = b;
    if (!b) progBox.hidden = true;
  };

  el.addEventListener('click', async (e) => {
    if (e.target === el) { close(); return; }
    const a = e.target.closest('[data-a]')?.dataset.a;
    if (!a || busy) return;
    tap();
    result.hidden = true;
    if (a === 'close') close();
    else if (a === 'export') {
      setBusy(true);
      progBox.hidden = false; progMsg.textContent = 'Preparing backup…';
      progBar.parentElement.classList.add('indeterminate');
      try {
        const r = await MapStore.exportBackup();
        if (r?.ok) showResult(`Saved ${r.fileName || 'backup'}.`, 'ok');
        else if (!r?.cancelled) showResult(r?.error || 'Backup failed.', 'err');
      } catch (err) { showResult(err?.message || String(err), 'err'); }
      setBusy(false);
    } else if (a === 'import') {
      setBusy(true);
      try {
        const r = await MapStore.importBackup(onProgress);
        if (r?.ok) {
          showResult(`Imported ${r.manifest?.id || 'map'}. Restarting…`, 'ok');
          setTimeout(() => location.reload(), 700);
          return;
        }
        if (!r?.cancelled) showResult(r?.error || 'Import failed. Your current map is unchanged.', 'err');
      } catch (err) { showResult(err?.message || String(err), 'err'); }
      setBusy(false);
    } else if (a === 'update') {
      const ok = await confirmDialog({
        title: 'Update map?',
        message: `This downloads about ${Math.round((app.bundle.reader?.size || 42e6) / 1e6)} MB. Use Wi-Fi if you can. Your current map stays installed until the new one is downloaded and verified.`,
        ok: 'Download',
      });
      if (!ok) return;
      setBusy(true);
      onProgress({ phase: 'download', loaded: 0, total: 0 });
      try {
        const r = await MapStore.update(onProgress);
        if (r?.ok && r.upToDate) showResult('Your map is already up to date.', 'ok');
        else if (r?.ok) {
          showResult(`Updated to ${r.manifest?.id || 'the latest map'}. Restarting…`, 'ok');
          setTimeout(() => location.reload(), 800);
          return;
        } else showResult(r?.error ? `${r.error} Your current map is unchanged.` : 'Update failed. Your current map is unchanged.', 'err');
      } catch (err) { showResult(`${err?.message || err} Your current map is unchanged.`, 'err'); }
      setBusy(false);
    }
  });

  // toggles
  const voice = $('[data-t="voice"]');
  voice.checked = !Voice.muted;
  voice.addEventListener('change', () => Voice.setMuted(!voice.checked));
  const sim = $('[data-t="sim"]');
  sim.checked = !!app.settings.simulate;
  sim.addEventListener('change', () => { app.settings.simulate = sim.checked; });
  const url = $('[data-t="url"]');
  url.value = MapStore.getUpdateUrl();
  url.addEventListener('change', () => { MapStore.setUpdateUrl(url.value.trim()); toast('Update source saved'); });

  // Drag down on the grab bar to close.
  let y0 = null;
  const sheet = $('.modal-sheet');
  $('.modal-grab').addEventListener('pointerdown', (e) => { y0 = e.clientY; $('.modal-grab').setPointerCapture(e.pointerId); sheet.style.transition = 'none'; });
  $('.modal-grab').addEventListener('pointermove', (e) => { if (y0 != null) sheet.style.transform = `translateY(${Math.max(0, e.clientY - y0)}px)`; });
  const up = (e) => {
    if (y0 == null) return;
    const dy = e.clientY - y0; y0 = null;
    sheet.style.transition = ''; sheet.style.transform = '';
    if (dy > 90) close();
  };
  $('.modal-grab').addEventListener('pointerup', up);
  $('.modal-grab').addEventListener('pointercancel', up);
}
