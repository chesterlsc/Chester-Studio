/* 30 Years, No Power: reader features. No dependencies, works offline. */
(function () {
  'use strict';
  var d = document, de = d.documentElement, body = d.body;
  var ROOT = body.getAttribute('data-root') || '';
  var $ = function (s, el) { return (el || d).querySelector(s); };
  var $$ = function (s, el) { return Array.prototype.slice.call((el || d).querySelectorAll(s)); };

  // ---------- storage (always guarded) ----------
  function load(k, def) { try { var v = localStorage.getItem('fm30:' + k); return v ? JSON.parse(v) : def; } catch (e) { return def; } }
  function save(k, v) { try { localStorage.setItem('fm30:' + k, JSON.stringify(v)); } catch (e) { } }
  var prefs = load('prefs', {});
  var readMap = load('read', {});
  var checks = load('checks', {});

  function applyPrefs() {
    if (prefs.theme && prefs.theme !== 'auto') de.dataset.theme = prefs.theme; else delete de.dataset.theme;
    if (prefs.size) de.dataset.size = prefs.size; else delete de.dataset.size;
    if (prefs.spacing) de.dataset.spacing = prefs.spacing; else delete de.dataset.spacing;
    $$('.seg[data-pref]').forEach(function (seg) {
      var k = seg.getAttribute('data-pref');
      var cur = prefs[k] == null ? (k === 'theme' ? 'auto' : k === 'rate' ? '1' : '') : String(prefs[k]);
      $$('button', seg).forEach(function (b) { b.setAttribute('aria-pressed', b.getAttribute('data-v') === cur ? 'true' : 'false'); });
    });
  }
  applyPrefs();

  // ---------- drawer + modals ----------
  var drawer = $('#drawer'), scrim = $('.scrim');
  var lastFocus = null;
  function openDrawer() { if (!drawer) return; lastFocus = d.activeElement; drawer.classList.add('on'); scrim.classList.add('on'); drawer.setAttribute('aria-hidden', 'false'); var cur = $('[aria-current="page"]', drawer) || $('a', drawer); if (cur) { cur.scrollIntoView({ block: 'center' }); cur.focus({ preventScroll: true }); } }
  function closeAll() {
    if (drawer) { drawer.classList.remove('on'); drawer.setAttribute('aria-hidden', 'true'); }
    if (scrim) scrim.classList.remove('on');
    $$('.modal.on').forEach(function (m) { m.classList.remove('on'); });
    stopAuto();
    if (lastFocus && lastFocus.focus) lastFocus.focus({ preventScroll: true });
  }
  function openModal(id) { var m = $('#' + id); if (!m) return; lastFocus = d.activeElement; m.classList.add('on'); var f = $('input, button', m); if (f) setTimeout(function () { f.focus(); }, 30); }
  d.addEventListener('click', function (e) {
    var t = e.target;
    if (t.closest('[data-close]')) { closeAll(); return; }
    if (t.classList && t.classList.contains('modal')) { closeAll(); return; }
    var act = t.closest('[data-action]');
    if (act) {
      var a = act.getAttribute('data-action');
      if (a === 'toc') openDrawer();
      else if (a === 'search') { openModal('search-modal'); }
      else if (a === 'settings') openModal('settings-modal');
      else if (a === 'skim') toggleSkim();
      else if (a === 'read') startReading();
      else if (a === 'print') window.print();
      else if (a === 'done') toggleDone();
      else if (a === 'reset-progress') { if (confirm('Reset all reading progress and checklists on this device?')) { readMap = {}; checks = {}; save('read', readMap); save('checks', checks); location.reload(); } }
    }
    var seg = t.closest('.seg[data-pref] button');
    if (seg) { var k = seg.parentNode.getAttribute('data-pref'); var v = seg.getAttribute('data-v'); prefs[k] = k === 'rate' ? parseFloat(v) : v; save('prefs', prefs); applyPrefs(); }
  });
  d.addEventListener('keydown', function (e) {
    var tag = (e.target.tagName || '').toLowerCase();
    var typing = tag === 'input' || tag === 'textarea' || tag === 'select';
    if (e.key === 'Escape') { closeAll(); stopReading(); return; }
    if (typing) return;
    if (e.key === '/' || ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k')) { e.preventDefault(); openModal('search-modal'); }
  });

  // ---------- reading progress + on-this-page ----------
  var bar = $('.progress span');
  var article = $('.ch-body');
  function onScroll() {
    if (!bar) return;
    var h = d.documentElement.scrollHeight - innerHeight;
    bar.style.width = (h > 0 ? Math.min(100, (scrollY / h) * 100) : 0) + '%';
  }
  addEventListener('scroll', onScroll, { passive: true }); onScroll();
  if ('IntersectionObserver' in window && $('.onpage')) {
    var links = {}; $$('.onpage a').forEach(function (a) { links[a.getAttribute('href').slice(1)] = a; });
    var io = new IntersectionObserver(function (ents) {
      ents.forEach(function (en) { if (en.isIntersecting) { $$('.onpage a.on').forEach(function (a) { a.classList.remove('on'); }); var l = links[en.target.id]; if (l) l.classList.add('on'); } });
    }, { rootMargin: '-80px 0px -70% 0px' });
    $$('.ch-body h2[id]').forEach(function (h) { io.observe(h); });
  }

  // ---------- skim mode ----------
  function setSkim(on) { body.classList.toggle('skim', on); $$('[data-action="skim"]').forEach(function (b) { if (b.hasAttribute('aria-pressed')) b.setAttribute('aria-pressed', on ? 'true' : 'false'); }); }
  function toggleSkim() { prefs.skim = !body.classList.contains('skim'); save('prefs', prefs); setSkim(prefs.skim); }
  if (article) setSkim(!!prefs.skim);

  // ---------- read state ----------
  var mainEl = $('main[data-chapter]');
  var chId = mainEl ? mainEl.getAttribute('data-chapter') : null;
  function markLinks() {
    $$('[data-ch]').forEach(function (a) { a.classList.toggle('read', !!readMap[a.getAttribute('data-ch')]); });
  }
  function toggleDone() {
    if (!chId) return;
    if (readMap[chId]) delete readMap[chId]; else readMap[chId] = Date.now();
    save('read', readMap); syncDone(); markLinks();
  }
  function syncDone() {
    var b = $('.done-btn'); if (!b || !chId) return;
    var on = !!readMap[chId];
    b.setAttribute('aria-pressed', on ? 'true' : 'false');
    b.textContent = on ? '✓ Read. Tap to undo' : '✓ Mark chapter as read';
    var n = $('#done-note'); if (n) n.textContent = Object.keys(readMap).length + ' chapters read so far';
  }
  syncDone(); markLinks();

  // home progress
  (function homeProgress() {
    var ring = $('#ring'); if (!ring) return;
    var tocLinks = $$('.toc-part a[data-ch]');
    var total = tocLinks.length, read = tocLinks.filter(function (a) { return readMap[a.getAttribute('data-ch')]; }).length;
    var pct = total ? Math.round(read / total * 100) : 0;
    ring.style.setProperty('--p', pct); $('#ring-n').textContent = pct + '%'; $('#read-n').textContent = read;
    var nChecks = Object.keys(checks).length; $('#check-n').textContent = nChecks + ' checklist item' + (nChecks === 1 ? '' : 's') + ' done';
    $$('.part-card[data-part]').forEach(function (card) {
      var grp = $('.toc-part[data-part="' + card.getAttribute('data-part') + '"]'); if (!grp) return;
      var ls = $$('a[data-ch]', grp), r = ls.filter(function (a) { return readMap[a.getAttribute('data-ch')]; }).length;
      $('.p-read', card).textContent = r; $('.pbar i', card).style.width = (ls.length ? r / ls.length * 100 : 0) + '%';
    });
  })();
  $$('.ch-card[data-ch]').forEach(function (a) { a.classList.toggle('read', !!readMap[a.getAttribute('data-ch')]); });

  // ---------- checklists ----------
  $$('.checklist-wrap').forEach(function (w) {
    var boxes = $$('input[type="checkbox"]', w), cnt = $('.cl-count', w), fill = $('.bar i', w);
    function upd() { var n = boxes.filter(function (b) { return b.checked; }).length; if (cnt) cnt.textContent = n + ' / ' + boxes.length + ' done'; if (fill) fill.style.width = (boxes.length ? n / boxes.length * 100 : 0) + '%'; }
    boxes.forEach(function (b) {
      var k = b.getAttribute('data-key'); b.checked = !!checks[k];
      b.addEventListener('change', function () { if (b.checked) checks[k] = 1; else delete checks[k]; save('checks', checks); upd(); });
    });
    upd();
  });

  // ---------- flashcards ----------
  $$('.card').forEach(function (c) {
    function flip() { c.classList.toggle('flip'); }
    c.addEventListener('click', flip);
    c.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); flip(); } });
  });
  $$('.cards-bar button').forEach(function (b) {
    b.addEventListener('click', function () {
      var deck = b.parentNode.previousElementSibling; if (!deck) return;
      var cs = $$('.card', deck), act = b.getAttribute('data-cards');
      if (act === 'flip') { var any = cs.some(function (c) { return !c.classList.contains('flip'); }); cs.forEach(function (c) { c.classList.toggle('flip', any); }); }
      else if (act === 'reset') cs.forEach(function (c) { c.classList.remove('flip'); });
      else if (act === 'shuffle') { cs.forEach(function (c) { c.classList.remove('flip'); }); for (var i = cs.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)); deck.appendChild(cs[j]); cs.splice(j, 1); } $$('.card', deck).forEach(function (c) { deck.appendChild(c); }); }
    });
  });

  // ---------- speech ----------
  var synth = window.speechSynthesis, queue = [], qi = 0, speaking = false;
  var sbar = $('#speech-bar');
  function cleanText(el) { var c = el.cloneNode(true); $$('sup.cite, .anchor, .box-label, .w-print', c).forEach(function (x) { x.remove(); }); return c.textContent.replace(/\s+/g, ' ').trim(); }
  function speak(text, onend) {
    if (!synth) { alert('Read aloud is not supported in this browser.'); return; }
    var u = new SpeechSynthesisUtterance(text); u.rate = prefs.rate || 1; u.lang = 'en-US';
    u.onend = onend || null; u.onerror = onend || null; synth.speak(u);
  }
  function startReading() {
    if (!article) return;
    if (!synth) { alert('Read aloud is not supported in this browser.'); return; }
    stopReading();
    var sel = '.tldr li, h2, h3, .ch-body > p, .box h4, .box p, .box li, .stat, ol.steps > li, .ch-body > ul:not(.checklist) > li, .ch-body > ol.timeline > li, .myth, .fact, .compare h4, .compare li, figcaption, ul.checklist li, .table-wrap caption';
    queue = $$(sel, article).filter(function (el) { return el.offsetParent !== null && !el.closest('ol.sources') && cleanText(el).length > 1; });
    // start at the first block on screen
    qi = 0; for (var i = 0; i < queue.length; i++) { if (queue[i].getBoundingClientRect().top > 60) { qi = i; break; } }
    speaking = true; if (sbar) sbar.classList.add('on'); next();
  }
  function next() {
    $$('.reading').forEach(function (x) { x.classList.remove('reading'); });
    if (!speaking || qi >= queue.length) { stopReading(); return; }
    var el = queue[qi++]; el.classList.add('reading'); el.scrollIntoView({ block: 'center', behavior: 'smooth' });
    var lbl = $('#speech-label'); if (lbl) lbl.textContent = 'Reading ' + qi + ' of ' + queue.length;
    speak(cleanText(el), function () { setTimeout(next, 120); });
  }
  function stopReading() { speaking = false; if (synth) synth.cancel(); $$('.reading').forEach(function (x) { x.classList.remove('reading'); }); if (sbar) sbar.classList.remove('on'); }
  if (sbar) sbar.addEventListener('click', function (e) {
    var b = e.target.closest('button'); if (!b) return;
    var a = b.getAttribute('data-speech');
    if (a === 'stop') stopReading();
    if (a === 'pause') { if (synth.paused) { synth.resume(); b.textContent = '⏸ Pause'; } else { synth.pause(); b.textContent = '▶ Resume'; } }
  });

  // ---------- step player ----------
  var player = $('#player-modal'), stage = $('#player-stage'), pbar = player && $('.player-bar i', player);
  var steps = [], si = 0, autoTimer = null, autoOn = false;
  function renderStep() {
    var li = steps[si]; if (!li) return;
    var h = $('h4', li), rest = li.cloneNode(true); $$('h4', rest).forEach(function (x) { x.remove(); });
    stage.innerHTML = '<div class="player-num">Step ' + (si + 1) + ' of ' + steps.length + '</div><h4></h4><div class="player-body"></div>';
    $('h4', stage).textContent = h ? h.textContent : '';
    $('.player-body', stage).innerHTML = rest.innerHTML;
    if (pbar) pbar.style.width = ((si + 1) / steps.length * 100) + '%';
  }
  function stepDur() { var w = (steps[si] && steps[si].textContent.split(/\s+/).length) || 10; return Math.min(16000, 3500 + w * 330); }
  function stopAuto() { autoOn = false; clearTimeout(autoTimer); var b = player && $('[data-p="auto"]', player); if (b) b.textContent = '▶ Auto-play'; }
  function tick() { if (!autoOn) return; autoTimer = setTimeout(function () { if (si < steps.length - 1) { si++; renderStep(); tick(); } else stopAuto(); }, stepDur()); }
  d.addEventListener('click', function (e) {
    var b = e.target.closest('[data-play]'); if (!b) return;
    var ol = b.closest('.steps-wrap').querySelector('ol.steps'); steps = $$(':scope > li', ol); si = 0;
    var h2 = null, el = b.closest('.steps-wrap'); while (el && (el = el.previousElementSibling)) { if (/^H[23]$/.test(el.tagName)) { h2 = el; break; } }
    $('#player-title').textContent = h2 ? cleanText(h2) : 'Step by step';
    lastFocus = b; player.classList.add('on'); renderStep(); $('[data-p="next"]', player).focus();
  });
  if (player) {
    player.addEventListener('click', function (e) {
      var b = e.target.closest('[data-p]'); if (!b) return;
      var a = b.getAttribute('data-p');
      if (a === 'next' && si < steps.length - 1) { si++; renderStep(); }
      if (a === 'prev' && si > 0) { si--; renderStep(); }
      if (a === 'auto') { if (autoOn) stopAuto(); else { autoOn = true; b.textContent = '⏸ Pause'; tick(); } }
      if (a === 'speak') { if (synth) synth.cancel(); speak(cleanText(steps[si])); }
    });
    player.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowRight' && si < steps.length - 1) { si++; renderStep(); }
      if (e.key === 'ArrowLeft' && si > 0) { si--; renderStep(); }
    });
  }

  // ---------- search ----------
  var sIndex = null, sInput = $('#search-input'), sOut = $('#search-results'), sSel = 0;
  function loadIndex(cb) {
    if (sIndex) return cb();
    fetch(ROOT + 'search-index.json').then(function (r) { return r.json(); }).then(function (j) { sIndex = j; cb(); }).catch(function () { sOut.innerHTML = '<div class="s-empty">Search index could not load. If you opened the file directly, open the book through a web server or the installed app.</div>'; });
  }
  function escH(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function doSearch() {
    var q = (sInput.value || '').trim().toLowerCase();
    if (q.length < 2) { sOut.innerHTML = '<div class="s-empty">Type at least 2 letters. Works offline.</div>'; return; }
    loadIndex(function () {
      var terms = q.split(/\s+/).filter(Boolean), res = [];
      sIndex.forEach(function (c) {
        var tl = c.t.toLowerCase();
        c.s.forEach(function (s) {
          var hl = s.h.toLowerCase(), xl = s.x.toLowerCase(), score = 0, ok = true;
          terms.forEach(function (t) {
            var sc = 0;
            if (tl.indexOf(t) > -1) sc += 6;
            if (hl.indexOf(t) > -1) sc += 4;
            var n = 0, p = xl.indexOf(t); while (p > -1 && n < 8) { n++; p = xl.indexOf(t, p + t.length); }
            sc += n;
            if (!sc) ok = false; score += sc;
          });
          if (ok && score) res.push({ c: c, s: s, score: score });
        });
      });
      res.sort(function (a, b) { return b.score - a.score; });
      var seen = {}, out = [];
      res.forEach(function (r) { var k = r.c.id + '#' + r.s.a; if (seen[k] || out.length >= 30) return; seen[k] = 1; out.push(r); });
      if (!out.length) { sOut.innerHTML = '<div class="s-empty">No matches. Try a simpler word (for example "fever", "bleach", "puppy").</div>'; return; }
      sSel = 0;
      sOut.innerHTML = out.map(function (r, i) {
        var xl = r.s.x.toLowerCase(), p = xl.indexOf(terms[0]); var st = Math.max(0, p - 70);
        var snip = escH((st ? '…' : '') + r.s.x.slice(st, st + 190) + '…');
        terms.forEach(function (t) { if (t.length > 1) snip = snip.replace(new RegExp('(' + t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + ')', 'ig'), '<mark>$1</mark>'); });
        return '<a class="s-result' + (i === 0 ? ' sel' : '') + '" href="' + ROOT + 'c/' + r.c.id + '.html' + (r.s.a ? '#' + r.s.a : '') + '"><div class="s-p">' + r.c.i + ' Ch. ' + r.c.n + ' · ' + escH(r.c.p) + '</div><div class="s-t">' + escH(r.c.t) + (r.s.h !== 'Summary' ? ' › ' + escH(r.s.h) : '') + '</div><div class="s-x">' + snip + '</div></a>';
      }).join('');
    });
  }
  if (sInput) {
    var tmr; sInput.addEventListener('input', function () { clearTimeout(tmr); tmr = setTimeout(doSearch, 120); });
    sInput.addEventListener('keydown', function (e) {
      var items = $$('.s-result', sOut); if (!items.length) return;
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') { e.preventDefault(); items[sSel].classList.remove('sel'); sSel = (sSel + (e.key === 'ArrowDown' ? 1 : -1) + items.length) % items.length; items[sSel].classList.add('sel'); items[sSel].scrollIntoView({ block: 'nearest' }); }
      if (e.key === 'Enter') { e.preventDefault(); location.href = items[sSel].href; }
    });
  }

  // ---------- widgets ----------
  var actx = null;
  function beep(freq, len) {
    try { actx = actx || new (window.AudioContext || window.webkitAudioContext)(); var o = actx.createOscillator(), g = actx.createGain(); o.frequency.value = freq || 880; o.connect(g); g.connect(actx.destination); g.gain.setValueAtTime(0.25, actx.currentTime); g.gain.exponentialRampToValueAtTime(0.0001, actx.currentTime + (len || 0.08)); o.start(); o.stop(actx.currentTime + (len || 0.08) + 0.02); } catch (e) { }
  }
  function fmt(n, dp) { return Number(n).toLocaleString(undefined, { maximumFractionDigits: dp == null ? 1 : dp }); }
  var W = {
    metronome: function (w) {
      var bpm = parseInt(w.getAttribute('data-bpm'), 10) || 110;
      w.innerHTML = '<div class="w-title">❤️ ' + escH(w.getAttribute('data-label') || 'CPR metronome') + '</div><div class="w-row" style="align-items:center;gap:1rem"><div class="metro-dot" aria-hidden="true"></div><div><div class="big"><span class="m-count">0</span></div><div style="font-size:.8rem;color:var(--muted)">compressions</div></div></div><div class="w-row"><label>Beats per minute<input type="number" min="60" max="140" value="' + bpm + '" class="m-bpm"></label><button type="button" class="w-btn m-go">▶ Start</button><button type="button" class="w-btn ghost m-reset">Reset</button></div><div class="w-src">Push hard and fast on each beat. Sound plays on each beat (turn volume up).</div>';
      var dot = $('.metro-dot', w), cnt = $('.m-count', w), go = $('.m-go', w), inp = $('.m-bpm', w), timer = null, n = 0;
      function stop() { clearInterval(timer); timer = null; go.textContent = '▶ Start'; }
      go.addEventListener('click', function () {
        if (timer) return stop();
        var iv = 60000 / Math.max(60, Math.min(140, parseInt(inp.value, 10) || bpm));
        go.textContent = '■ Stop';
        timer = setInterval(function () { n++; cnt.textContent = n; beep(n % 30 === 0 ? 1200 : 880, 0.05); dot.classList.add('beat'); setTimeout(function () { dot.classList.remove('beat'); }, 90); if (navigator.vibrate) navigator.vibrate(25); }, iv);
      });
      $('.m-reset', w).addEventListener('click', function () { stop(); n = 0; cnt.textContent = '0'; });
    },
    timer: function (w) {
      var secs = parseInt(w.getAttribute('data-seconds'), 10) || 60;
      w.innerHTML = '<div class="w-title">⏱ ' + escH(w.getAttribute('data-label') || 'Timer') + '</div><div class="big t-left">' + mmss(secs) + '</div><div class="w-row"><button type="button" class="w-btn t-go">▶ Start</button><button type="button" class="w-btn ghost t-reset">Reset</button></div>';
      var left = secs, timer = null, go = $('.t-go', w), out = $('.t-left', w);
      function mmss(s) { var m = Math.floor(s / 60), r = s % 60; return m + ':' + (r < 10 ? '0' : '') + r; }
      function stop() { clearInterval(timer); timer = null; go.textContent = '▶ Start'; }
      go.addEventListener('click', function () {
        if (timer) return stop();
        if (left <= 0) left = secs;
        go.textContent = '⏸ Pause';
        timer = setInterval(function () { left--; out.textContent = mmss(left); if (left <= 0) { stop(); out.textContent = 'Done ✓'; beep(660, .25); setTimeout(function () { beep(880, .3); }, 300); if (navigator.vibrate) navigator.vibrate([200, 100, 200]); } }, 1000);
      });
      $('.t-reset', w).addEventListener('click', function () { stop(); left = secs; out.textContent = mmss(secs); });
    },
    'calc-water': function (w) {
      w.innerHTML = '<div class="w-title">💧 Water storage calculator</div><div class="w-row"><label>People<input type="number" min="1" value="4" class="c-p"></label><label>Days<input type="number" min="1" value="14" class="c-d"></label></div><div class="w-out c-out"></div><div class="w-src">Basis: at least 1 gallon (3.8 L) per person per day for drinking and basic hygiene (CDC, FEMA). Store more for hot climates, pregnancy, breastfeeding, illness, and for pets.</div>';
      function upd() { var p = +$('.c-p', w).value || 0, dd = +$('.c-d', w).value || 0; var gal = p * dd, L = gal * 3.785; $('.c-out', w).innerHTML = '<b>' + fmt(L, 0) + ' liters</b> (' + fmt(gal, 0) + ' US gallons)<br>≈ ' + fmt(Math.ceil(L / 20), 0) + ' × 20 L jerrycans, or ' + fmt(Math.ceil(gal / 55), 0) + ' × 55-gallon drums'; }
      $$('input', w).forEach(function (i) { i.addEventListener('input', upd); }); upd();
    },
    'calc-bleach': function (w) {
      w.innerHTML = '<div class="w-title">🧴 Bleach dose for drinking water</div><div class="w-row"><label>Amount of water<input type="number" min="0" step="0.5" value="1" class="c-v"></label><label>Unit<select class="c-u"><option value="gal">US gallons</option><option value="l">Liters</option></select></label><label>Bleach strength<select class="c-s"><option value="6">6% sodium hypochlorite</option><option value="8.25">8.25% sodium hypochlorite</option></select></label><label>Water is<select class="c-c"><option value="1">Clear</option><option value="2">Cloudy, colored or very cold</option></select></label></div><div class="w-out c-out"></div><div class="w-src">EPA: 8 drops of 6% (or 6 drops of 8.25%) unscented bleach per gallon of clear water; double for cloudy, colored or very cold water. Stir, wait 30 minutes. Water should smell slightly of chlorine; if not, repeat the dose and wait 15 more minutes. Use plain, unscented bleach only.</div>';
      function upd() {
        var v = +$('.c-v', w).value || 0, u = $('.c-u', w).value, s = $('.c-s', w).value, c = +$('.c-c', w).value;
        var gal = u === 'l' ? v / 3.785 : v; var per = s === '6' ? 8 : 6; var drops = gal * per * c; var ml = drops / 20;
        $('.c-out', w).innerHTML = '<b>' + fmt(Math.ceil(drops), 0) + ' drops</b> ≈ ' + fmt(ml, 1) + ' ml' + (ml >= 1.2 ? ' ≈ ' + fmt(ml / 4.93, 2) + ' teaspoons' : '') + '<br>Stir, then wait <b>30 minutes</b> before drinking.';
      }
      $$('input,select', w).forEach(function (i) { i.addEventListener('input', upd); i.addEventListener('change', upd); }); upd();
    },
    'calc-food': function (w) {
      w.innerHTML = '<div class="w-title">🌾 Food calories calculator</div><div class="w-row"><label>People<input type="number" min="1" value="4" class="c-p"></label><label>Days<input type="number" min="1" value="365" class="c-d"></label><label>kcal / person / day<input type="number" min="800" step="50" value="2100" class="c-k"></label></div><div class="w-out c-out"></div><div class="w-src">2,100 kcal per person per day is the planning figure used in humanitarian food aid (Sphere Handbook). Energy per 100 g dry weight from USDA FoodData Central: white rice ≈365 kcal, dry pinto beans ≈347, rolled oats ≈379, vegetable oil ≈884. Real stores should mix foods for protein, fat and vitamins.</div>';
      function upd() {
        var p = +$('.c-p', w).value || 0, dd = +$('.c-d', w).value || 0, k = +$('.c-k', w).value || 0, tot = p * dd * k;
        function kg(per100) { return tot / (per100 * 10); }
        $('.c-out', w).innerHTML = '<b>' + fmt(tot / 1e6, 2) + ' million kcal</b> needed<br>If it all came from one food: ' + fmt(kg(365), 0) + ' kg (' + fmt(kg(365) * 2.205, 0) + ' lb) white rice, or ' + fmt(kg(347), 0) + ' kg dry beans, or ' + fmt(kg(379), 0) + ' kg oats, or ' + fmt(kg(884), 0) + ' kg oil.';
      }
      $$('input', w).forEach(function (i) { i.addEventListener('input', upd); }); upd();
    },
    'calc-ors': function (w) {
      w.innerHTML = '<div class="w-title">🥄 Oral rehydration solution (home recipe)</div><div class="w-row"><label>Liters of clean water<input type="number" min="0.5" step="0.5" value="1" class="c-l"></label></div><div class="w-out c-out"></div><div class="w-src">WHO/UNICEF home recipe: 6 level teaspoons of sugar and ½ level teaspoon of salt dissolved in 1 liter of clean (boiled and cooled) water. Measure carefully: too much salt is dangerous. Use packaged ORS sachets when you have them.</div>';
      function upd() { var l = +$('.c-l', w).value || 0; $('.c-out', w).innerHTML = '<b>' + fmt(6 * l, 1) + ' level tsp sugar</b> + <b>' + fmt(0.5 * l, 2) + ' level tsp salt</b> in ' + fmt(l, 1) + ' L (' + fmt(l * 33.8, 0) + ' fl oz) of clean water'; }
      $('input', w).addEventListener('input', upd); upd();
    },
  };
  $$('.widget[data-widget]').forEach(function (w) { var f = W[w.getAttribute('data-widget')]; if (f) { try { var keep = $('.w-print', w); f(w); if (keep) w.appendChild(keep); } catch (e) { } } });

  // ---------- offline (service worker) ----------
  var off = $('#offline-status');
  if ('serviceWorker' in navigator && location.protocol !== 'file:') {
    navigator.serviceWorker.register(ROOT + 'sw.js').then(function (reg) {
      function ask() { var sw = navigator.serviceWorker.controller || reg.active; if (sw) sw.postMessage('status'); }
      navigator.serviceWorker.addEventListener('message', function (e) {
        if (!off || !e.data || e.data.type !== 'status') return;
        off.textContent = e.data.cached >= e.data.total ? '✅ Whole book saved for offline use on this device (' + e.data.total + ' files). Add it to your home screen.' : '📥 Saving for offline: ' + e.data.cached + ' of ' + e.data.total + ' files…';
        if (e.data.cached < e.data.total) setTimeout(ask, 1500);
      });
      setTimeout(ask, 800);
    }).catch(function () { if (off) off.textContent = 'Offline saving is not available in this browser. Use Print / Save PDF instead.'; });
  } else if (off) off.textContent = 'Offline saving needs a web server or browser support. Use Print / Save PDF to keep a copy.';

  // print edition: open all flashcards for printing
  if (body.classList.contains('print-book')) $$('.card').forEach(function (c) { c.classList.remove('flip'); });
})();
