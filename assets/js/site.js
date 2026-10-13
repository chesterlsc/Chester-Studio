/* ============================================================
   CHESTER STUDIO :: shared by every page
   The header's command palette (⌘K) and the project intake.
   Pages call window.CS.openWizard(service, brief).
   Vanilla JS. No dependencies, no build step.
   ============================================================ */

(() => {
  "use strict";

  // pages below the root set <html data-root="../"> so every link resolves from the site root
  const ROOT = document.documentElement.dataset.root || "";
  const CS = (window.CS = window.CS || {});

  document.body.insertAdjacentHTML("beforeend", `
  <div class="wizard" id="wizard" role="dialog" aria-modal="true" aria-hidden="true" aria-label="Project intake">
    <div class="wizard__backdrop" id="wizardBackdrop"></div>
    <div class="wizard__panel">
      <div class="wizard__top">
        <span class="wizard__brand"><span class="wizard__brand-dot"></span> Project Intake</span>
        <span class="wizard__stepnum" id="wizardStepNum"></span>
        <button class="wizard__close" id="wizardClose" aria-label="Close intake form">✕</button>
      </div>
      <div class="wizard__progress"><span id="wizardBar"></span></div>
      <div class="wizard__viewport"><div class="wizard__step" id="wizardStep"></div></div>
      <div class="wizard__footer">
        <button class="wizard__back" id="wizardBack">← Back</button>
        <div class="wizard__dots" id="wizardDots"></div>
        <button class="btn btn--primary wizard__next" id="wizardNext"><span class="btn__text">Continue</span><span class="btn__arrow">→</span></button>
      </div>
    </div>
  </div>
  <div class="palette" id="palette" hidden>
    <div class="palette__backdrop" data-close></div>
    <div class="palette__panel" role="dialog" aria-modal="true" aria-label="Jump to">
      <div class="palette__search">
        <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="M20 20l-4-4"/></svg>
        <input id="paletteInput" type="text" role="combobox" aria-expanded="true" aria-controls="paletteList" aria-autocomplete="list"
          placeholder="Search, or describe a project" autocomplete="off" spellcheck="false" enterkeyhint="go" />
        <kbd class="palette__esc">esc</kbd>
        <button type="button" class="palette__cancel" data-close>Cancel</button>
      </div>
      <div class="palette__list" id="paletteList" role="listbox" aria-label="Results"></div>
      <div class="palette__foot">
        <span class="palette__keys"><kbd>↑</kbd><kbd>↓</kbd> move <kbd>↵</kbd> open <kbd>esc</kbd> close</span>
        <button type="button" class="palette__start" data-wizard-open>Start a project <span aria-hidden="true">→</span></button>
      </div>
    </div>
  </div>`);

  /* ==========================================================
     INTAKE WIZARD
     ========================================================== */
  const ICONS = {
    globe: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>',
    zap: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M13 2 3 14h9l-1 8 10-12h-9l1-8z"/></svg>',
    chart: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M3 21h18"/><path d="M6 21V10M11 21V6M16 21v-8M21 21V3"/></svg>',
    blocks: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="8" height="8" rx="2"/><rect x="13" y="3" width="8" height="8" rx="2"/><rect x="3" y="13" width="8" height="8" rx="2"/><rect x="13" y="13" width="8" height="8" rx="2"/></svg>',
    target: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>',
    clock: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>',
    trend: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="m23 6-9.5 9.5-5-5L1 18"/><path d="M17 6h6v6"/></svg>',
    star: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"><path d="m12 2 3.1 6.3 6.9 1-5 4.9 1.2 6.8L12 17.8 5.8 21l1.2-6.8-5-4.9 6.9-1z"/></svg>',
    coin: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8M12 6v2m0 8v2"/></svg>',
    cart: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M3 4h2l2.4 11.2a1 1 0 0 0 1 .8h9.1a1 1 0 0 0 1-.76L20 8H6.2"/><circle cx="9.5" cy="19.5" r="1.3"/><circle cx="17" cy="19.5" r="1.3"/></svg>',
  };

  // the service ids are what the rest of the site passes in; labels are what the client reads
  const SERVICES = [
    { v: "Website", label: "Website or online store", d: "New site, redesign, Shopify or custom", icon: "globe",
      follow: ["Is there a site already?", ["Starting fresh", "Redesign what I have", "Fix something on it"]] },
    { v: "WordPress / WooCommerce", label: "WordPress or WooCommerce", d: "Build, extend, or monthly care", icon: "cart",
      follow: ["What do you need?", ["A new site or store", "Add to my site", "Monthly care plan"]] },
    { v: "Digital Product", label: "Custom software", d: "Web app, client portal or MVP", icon: "blocks",
      follow: ["Who will use it?", ["My customers", "My team", "Both"]] },
    { v: "Business System", label: "Dashboard or internal tool", d: "Your numbers, stock, staff or orders", icon: "chart",
      follow: ["Where does the work live now?", ["Spreadsheets", "Another app", "On paper"]] },
    { v: "AI Automation", label: "AI or automation", d: "Support chat, bookings, follow-ups", icon: "zap",
      follow: ["What should it handle?", ["Customer questions", "Bookings", "Follow-ups and busywork", "Content"]] },
    { v: "Not sure yet", label: "Not sure yet", d: "Tell me the problem, I'll suggest the fix", icon: "target",
      follow: ["What would make this a win?", ["More customers", "Less manual work", "Launch something new"]] },
  ];
  const BUDGETS = {
    php: ["Under ₱50,000", "₱50,000 – ₱150,000", "₱150,000 – ₱500,000", "₱500,000+", "Not sure, advise me"],
    usd: ["Under $1,000", "$1,000 – $3,000", "$3,000 – $10,000", "$10,000+", "Not sure, advise me"],
  };
  const CARE = {
    php: ["Under ₱3,000 / month", "₱3,000 – ₱8,000 / month", "₱8,000+ / month", "Not sure, recommend one"],
    usd: ["Under $60 / month", "$60 – $150 / month", "$150+ / month", "Not sure, recommend one"],
  };
  const TIMING = [
    { v: "This month", icon: "zap" },
    { v: "1–3 months", icon: "clock" },
    { v: "Later this year", icon: "clock" },
    { v: "Flexible / exploring", icon: "target" },
  ];
  const NOTE_PROMPTS = ["Deadline", "Current site", "Sites I like", "Already tried", "Who signs off"];
  const CHANNELS = ["Email only", "Viber", "WhatsApp"];
  const STEP_LABEL = { service: "Building", follow: "Detail", budget: "Budget", care: "Budget", timing: "Timing", details: "Reply to" };
  const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
  const DRAFT_KEY = "csIntake";

  const wizard = document.getElementById("wizard");
  const wizardStep = document.getElementById("wizardStep");
  const wizardBar = document.getElementById("wizardBar");
  const wizardStepNum = document.getElementById("wizardStepNum");
  const wizardBack = document.getElementById("wizardBack");
  const wizardNext = document.getElementById("wizardNext");
  const wizardDots = document.getElementById("wizardDots");
  // Cloudflare Worker in api/ that forwards the brief through Resend
  const FORM_ENDPOINT = "https://chester-studio-contact.chesterlsc.workers.dev";

  let answers = {};
  let stepIdx = 0;
  let sent = false; // false | "sending" | "ok" | "error"
  let receipt = false; // the relay emailed the client a copy

  // a half-finished brief survives a closed tab or a stray click
  try {
    const d = JSON.parse(localStorage.getItem(DRAFT_KEY) || "null");
    if (d && d.answers) { answers = d.answers; stepIdx = d.stepIdx || 0; }
  } catch {}
  const saveDraft = () => {
    try { localStorage.setItem(DRAFT_KEY, JSON.stringify({ answers, stepIdx })); } catch {}
  };
  if (!answers.cur) {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    answers.cur = tz === "Asia/Manila" ? "php" : "usd";
  }

  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const svcOf = (v) => SERVICES.find((s) => s.v === v);
  const isCare = () => answers.follow === "Monthly care plan";
  const steps = () => {
    const s = ["service"];
    if (svcOf(answers.service)) s.push("follow");
    s.push(isCare() ? "care" : "budget", "timing", "details", "review");
    return s;
  };
  const stepKey = () => steps()[stepIdx];
  const answerKey = (k) => (k === "care" ? "budget" : k);
  const valueText = (k) => {
    if (k === "service") return svcOf(answers.service)?.label;
    if (k === "details") return answers.email && answers.email + (answers.reply && answers.reply !== "Email only" ? ` · ${answers.reply} ${answers.phone || ""}` : "");
    return answers[answerKey(k)];
  };

  // the next business day, 6 pm Manila, shown in the client's own time
  function replyBy() {
    const d = new Date(Date.now() + 8 * 3600e3);
    do d.setUTCDate(d.getUTCDate() + 1); while (d.getUTCDay() === 0 || d.getUTCDay() === 6);
    return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate(), 10))
      .toLocaleString(undefined, { weekday: "long", day: "numeric", month: "long", hour: "numeric", minute: "2-digit" });
  }

  const optionsHtml = (key, list) => `<div class="wizard__options">${list
    .map((o) => {
      const v = typeof o === "string" ? o : o.v;
      return `<button type="button" class="wizard-option ${answers[key] === v ? "is-selected" : ""}" data-key="${key}" data-value="${esc(v)}" aria-pressed="${answers[key] === v}">
          ${o.icon ? `<span class="wizard-option__icon">${ICONS[o.icon]}</span>` : ""}
          <span><strong>${esc(o.label || v)}</strong>${o.d ? `<small>${esc(o.d)}</small>` : ""}</span>
          <span class="wizard-option__check">✓</span>
        </button>`;
    })
    .join("")}</div>`;

  const currencyHtml = () => `<span class="wizard__cur" role="group" aria-label="Currency">${["php", "usd"]
    .map((c) => `<button type="button" data-cur="${c}" aria-pressed="${answers.cur === c}">${c === "php" ? "₱ PHP" : "$ USD"}</button>`)
    .join("")}</span>`;

  function renderStep(dir) {
    const k = stepKey();
    const head = (q, hint) => `<h3 class="wizard__q">${q}</h3>${hint ? `<p class="wizard__hint">${hint}</p>` : ""}`;
    let html = answers.brief && !sent
      ? `<p class="wizard__echo"><b>You said</b><span>${esc(answers.brief)}</span></p>`
      : "";

    if (sent) {
      html = sentHtml();
    } else if (k === "service") {
      html += head("Which is closest?", "Pick the nearest fit. You can change it later.") + optionsHtml("service", SERVICES);
    } else if (k === "follow") {
      const [q, list] = svcOf(answers.service).follow;
      html += head(q) + optionsHtml("follow", list);
    } else if (k === "budget" || k === "care") {
      html += `<div class="wizard__qrow">${head(k === "care" ? "Monthly budget?" : "Ballpark budget?")}${currencyHtml()}</div>
        <p class="wizard__hint">A range is enough to scope the right solution.</p>`
        + optionsHtml("budget", (k === "care" ? CARE : BUDGETS)[answers.cur]);
    } else if (k === "timing") {
      html += head("When do you need it?", "Honest timelines make better builds.") + optionsHtml("timing", TIMING);
    } else if (k === "details") {
      const phone = answers.reply && answers.reply !== "Email only";
      html += head("Where should I reply?", "Only used to answer this brief.") + `<div class="wizard__fields">
        <div class="wizard-field"><label for="wzName">Name <em>*</em></label><input type="text" id="wzName" data-k="name" autocomplete="name" placeholder="Your name" value="${esc(answers.name || "")}" /></div>
        <div class="wizard-field"><label for="wzEmail">Email <em>*</em></label><input type="email" id="wzEmail" data-k="email" autocomplete="email" placeholder="you@company.com" value="${esc(answers.email || "")}" /></div>
        <div class="wizard-field"><label for="wzCompany">Company or brand</label><input type="text" id="wzCompany" data-k="company" autocomplete="organization" placeholder="Optional" value="${esc(answers.company || "")}" /></div>
        <div class="wizard-field"><label>Also reach me on</label><div class="wizard__seg">${CHANNELS
          .map((c) => `<button type="button" data-reply="${c}" aria-pressed="${(answers.reply || "Email only") === c}">${c}</button>`)
          .join("")}</div></div>
        ${phone ? `<div class="wizard-field"><label for="wzPhone">${answers.reply} number <em>*</em></label><input type="tel" id="wzPhone" data-k="phone" autocomplete="tel" placeholder="+63 9xx xxx xxxx" value="${esc(answers.phone || "")}" /></div>` : ""}
        <input type="text" id="wzWebsite" data-k="website" class="wizard-hp" tabindex="-1" autocomplete="off" aria-hidden="true" />
      </div>`;
    } else if (k === "review") {
      const rows = steps()
        .filter((s) => s !== "review" && valueText(s))
        .map((s) => `<div class="wizard__summary-row"><span>${STEP_LABEL[s]}</span><b>${esc(valueText(s))}</b><button type="button" data-jump="${s}" aria-label="Edit ${STEP_LABEL[s]}">Edit</button></div>`)
        .join("");
      html += head("Your brief", "Check it over, then send. It goes straight to my inbox.") + `<div class="wizard__summary">${rows}</div>
        <div class="wizard-field wizard__notes"><label for="wzNotes">Anything else I should know? <small>Optional</small></label>
          <textarea id="wzNotes" data-k="notes" placeholder="Deadlines, your current site, examples you like, what you've tried, who signs off…">${esc(answers.notes || "")}</textarea></div>
        <div class="wizard__chips">${NOTE_PROMPTS.map((p) => `<button type="button" data-add="${p}">+ ${p}</button>`).join("")}</div>
        <p class="wizard__privacy">Goes only to Chester. No mailing list, no sharing.</p>`;
    }

    wizardStep.classList.remove("is-enter-left", "is-enter-right", "is-exit-left", "is-exit-right");
    wizardStep.innerHTML = html;
    if (dir) wizardStep.classList.add(dir > 0 ? "is-enter-right" : "is-enter-left");
    syncFooter();
    if (k === "details" && !sent) setTimeout(() => wizardStep.querySelector("input[data-k]:not(.wizard-hp)[value='']")?.focus(), 350);
  }

  function sentHtml() {
    if (sent === "sending") {
      return `<div class="wizard__sent"><div class="wizard__sent-icon is-wait">…</div><h4>Sending your brief…</h4><p>One moment.</p></div>`;
    }
    if (sent === "ok") {
      const via = answers.reply && answers.reply !== "Email only" ? ` on ${esc(answers.reply)} or email` : "";
      return `<div class="wizard__sent"><div class="wizard__sent-icon">✓</div><h4>Brief received.</h4>
        <p class="wizard__ref">Ref ${esc(answers.ref)}</p>
        <p>I'll reply${via} by <b>${esc(replyBy())}</b>, your time.${receipt ? ` A copy is on its way to <b>${esc(answers.email)}</b>. Reply to it any time to add more.` : ""}</p></div>`;
    }
    return `<div class="wizard__sent"><div class="wizard__sent-icon is-error">!</div><h4>That didn't send.</h4>
      <p>Your answers are saved on this device. Try again, or copy the brief and email it to <b class="wizard__addr">chestercatapia08@gmail.com</b>.</p>
      <pre class="wizard__brief">${esc(briefText())}</pre>
      <button type="button" class="wizard__copy" data-copy>Copy brief</button></div>`;
  }

  function stepValid() {
    const k = stepKey();
    if (k === "details") {
      const phoneOk = !answers.reply || answers.reply === "Email only" || (answers.phone || "").replace(/\D/g, "").length >= 7;
      return !!(answers.name || "").trim() && EMAIL_RE.test((answers.email || "").trim()) && phoneOk;
    }
    if (k === "review") return true;
    return !!answers[answerKey(k)];
  }

  function syncFooter() {
    const all = steps();
    const n = all.length;
    wizardBar.style.width = sent ? "100%" : `${Math.max(8, (stepIdx / (n - 1)) * 100)}%`;
    wizardStepNum.textContent = `${String(stepIdx + 1).padStart(2, "0")} / ${String(n).padStart(2, "0")}`;
    wizardBack.classList.toggle("is-hidden", stepIdx === 0 || !!sent);
    if (wizardDots.children.length !== n) wizardDots.innerHTML = "<i></i>".repeat(n);
    [...wizardDots.children].forEach((d, i) => {
      d.classList.toggle("is-active", i === stepIdx);
      d.classList.toggle("is-done", i < stepIdx);
    });
    const label = sent === "sending" ? "Sending…" : sent === "ok" ? "Done" : sent ? "Try again"
      : all[stepIdx] === "review" ? "Send brief" : "Continue";
    wizardNext.querySelector(".btn__text").textContent = label;
    wizardNext.querySelector(".btn__arrow").textContent = sent === "ok" ? "✓" : "→";
    wizardNext.disabled = sent === "sending" || (!sent && all[stepIdx] !== "details" && !stepValid());
    saveDraft();
  }

  function goTo(idx, dirOverride) {
    if (idx < 0 || idx >= steps().length) return;
    const dir = dirOverride !== undefined ? dirOverride : idx > stepIdx ? 1 : -1;
    wizardStep.classList.add(dir > 0 ? "is-exit-left" : "is-exit-right");
    setTimeout(() => {
      stepIdx = idx;
      renderStep(dir);
    }, 230);
  }

  function briefText() {
    const line = (k, v) => `${(k + ":").padEnd(11)}${v || "not specified"}`;
    return [
      `New project brief${answers.ref ? ` · ${answers.ref}` : ""}`,
      ``,
      line("Building", svcOf(answers.service)?.label),
      line("Detail", answers.follow),
      line("Budget", answers.budget),
      line("Timing", answers.timing),
      ``,
      `In their words:`,
      answers.brief || "not given",
      ``,
      `Notes:`,
      answers.notes || "none",
      ``,
      line("Name", answers.name),
      line("Email", answers.email),
      line("Company", answers.company),
      line("Reply on", answers.reply && answers.reply !== "Email only" ? `${answers.reply} ${answers.phone || ""}` : "Email"),
    ].join("\n");
  }

  async function submitWizard() {
    const d = new Date();
    answers.ref = `CS-${String(d.getMonth() + 1).padStart(2, "0")}${String(d.getDate()).padStart(2, "0")}-${Math.floor(Math.random() * 900 + 100)}`;
    sent = "sending";
    renderStep(1);
    try {
      const res = await fetch(FORM_ENDPOINT, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          name: answers.name, email: answers.email, website: answers.website,
          service: svcOf(answers.service)?.label, ref: answers.ref, replyBy: replyBy(),
          budget: answers.budget, timing: answers.timing, words: answers.brief, notes: answers.notes,
          brief: briefText(),
        }),
      });
      receipt = res.ok && !!(await res.json().catch(() => ({}))).receipt;
      sent = res.ok ? "ok" : "error";
    } catch {
      sent = "error";
    }
    renderStep(0);
  }

  // keeps who they are for next time, forgets the project
  function finish() {
    const { name, email, company, reply, phone, cur } = answers;
    answers = { name, email, company, reply, phone, cur };
    stepIdx = 0;
    sent = false;
    saveDraft();
  }

  // follow (optional) answers the service's follow-up too, e.g. the WordPress care plan
  function openWizard(preService, brief, follow) {
    if (sent === "ok") finish();
    sent = false;
    if (brief) answers.brief = brief;
    if (preService && svcOf(preService)) {
      if (answers.service !== preService) { answers.service = preService; delete answers.follow; }
      if (follow) answers.follow = follow;
      stepIdx = follow ? 2 : 1;
    }
    stepIdx = Math.min(stepIdx, steps().length - 1);
    renderStep(0);
    wizard.classList.add("is-open");
    wizard.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
  }

  function closeWizard() {
    wizard.classList.remove("is-open");
    wizard.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
    if (sent === "ok") finish();
  }

  document.getElementById("wizardClose").addEventListener("click", closeWizard);
  document.getElementById("wizardBackdrop").addEventListener("click", closeWizard);
  wizardBack.addEventListener("click", () => goTo(stepIdx - 1));

  wizardStep.addEventListener("click", async (e) => {
    const b = e.target.closest("button");
    if (!b) return;
    if (b.dataset.key) {
      const was = isCare();
      answers[b.dataset.key] = b.dataset.value;
      if (b.dataset.key === "service") delete answers.follow;
      if (was !== isCare()) delete answers.budget;
      wizardStep.querySelectorAll(".wizard-option").forEach((o) => {
        o.classList.toggle("is-selected", o === b);
        o.setAttribute("aria-pressed", o === b);
      });
      syncFooter();
    } else if (b.dataset.cur) {
      answers.cur = b.dataset.cur;
      delete answers.budget;
      renderStep(0);
    } else if (b.dataset.reply) {
      answers.reply = b.dataset.reply;
      renderStep(0);
    } else if (b.dataset.jump) {
      goTo(steps().indexOf(b.dataset.jump));
    } else if (b.dataset.add) {
      const t = document.getElementById("wzNotes");
      t.value = (t.value.trim() ? t.value.replace(/\s*$/, "\n") : "") + `${b.dataset.add}: `;
      answers.notes = t.value;
      saveDraft();
      t.focus();
      t.setSelectionRange(t.value.length, t.value.length);
    } else if ("copy" in b.dataset) {
      try {
        await navigator.clipboard.writeText(briefText());
        b.textContent = "Copied ✓";
      } catch {
        const r = document.createRange();
        r.selectNodeContents(wizardStep.querySelector(".wizard__brief"));
        getSelection().removeAllRanges();
        getSelection().addRange(r);
        b.textContent = "Selected. Copy it now";
      }
    }
  });
  wizardStep.addEventListener("input", (e) => {
    const k = e.target.dataset.k;
    if (!k) return;
    answers[k] = e.target.value;
    e.target.classList.remove("is-invalid");
    saveDraft();
  });

  wizardNext.addEventListener("click", () => {
    if (sent === "ok") { closeWizard(); return; }
    if (sent === "error" || stepKey() === "review") { submitWizard(); return; }
    if (!stepValid()) {
      if (stepKey() !== "details") return;
      const bad = [
        ["wzName", !(answers.name || "").trim()],
        ["wzEmail", !EMAIL_RE.test((answers.email || "").trim())],
        ["wzPhone", (answers.phone || "").replace(/\D/g, "").length < 7],
      ];
      bad.forEach(([id, isBad]) => { const el = document.getElementById(id); if (el && isBad) el.classList.add("is-invalid"); });
      return;
    }
    goTo(stepIdx + 1);
  });

  // any [data-wizard-open] on any page, including ones added later
  document.addEventListener("click", (e) => {
    const b = e.target.closest("[data-wizard-open]");
    if (b) { closePalette(true); openWizard(b.dataset.wizardService); }
  });

  addEventListener("keydown", (e) => {
    if (!wizard.classList.contains("is-open")) return;
    if (e.key === "Escape") closeWizard();
    if (e.key === "Enter" && !e.shiftKey && e.target.tagName !== "TEXTAREA" && !e.target.closest(".wizard__step button")) {
      e.preventDefault();
      if (!wizardNext.disabled) wizardNext.click();
    }
  });

  /* ==========================================================
     HEADER: scroll state, hide/show, progress
     ========================================================== */
  const header = document.getElementById("header");
  const progressBar = document.getElementById("scrollProgress");
  let lastY = 0;
  addEventListener("scroll", () => {
    const y = scrollY;
    header.classList.toggle("is-scrolled", y > 40);
    header.classList.toggle("is-hidden", y > 500 && y > lastY && palette.hidden);
    lastY = y;
    if (progressBar) {
      const max = document.documentElement.scrollHeight - innerHeight;
      progressBar.style.width = (max > 0 ? (y / max) * 100 : 0) + "%";
    }
  }, { passive: true });

  /* ==========================================================
     COMMAND PALETTE
     One field for the whole site: type a section, a service or
     a plain-words problem. Anything that isn't a page becomes
     the first line of a brief.
     ========================================================== */
  const palette = document.getElementById("palette");
  const pInput = document.getElementById("paletteInput");
  const pList = document.getElementById("paletteList");
  const isMac = /Mac|iPhone|iPad/.test(navigator.platform || navigator.userAgent);
  document.querySelectorAll(".nav__kbd").forEach((k) => (k.textContent = isMac ? "⌘ K" : "Ctrl K"));

  const go = (href) => () => { location.href = href; };
  const ITEMS = [
    { g: "Pages", t: "Work", d: "Four products, built end to end", k: "portfolio projects case study", run: go(ROOT + "#work") },
    { g: "Pages", t: "What I build", d: "Dashboards, AI, automation, software", k: "services offer", run: go(ROOT + "build/") },
    { g: "Pages", t: "WordPress", d: "Builds and monthly care", k: "woocommerce theme plugin care plan", run: go(ROOT + "#wordpress") },
    { g: "Pages", t: "Tools", d: "The stack behind the systems", k: "stack tech react node python", run: go(ROOT + "#tools") },
    { g: "Pages", t: "Contact", d: "Email, phone, Parañaque", k: "email phone call viber whatsapp location", run: go(ROOT + "#contact") },
    { g: "What I build", t: "Dashboards", d: "Your numbers in one place", k: "kpi report reports numbers stock branches analytics", run: go(ROOT + "build/#dashboards") },
    { g: "What I build", t: "AI implementation", d: "AI that does a real job", k: "ai chatbot chat assistant agent gpt claude receptionist support", run: go(ROOT + "build/#ai") },
    { g: "What I build", t: "Behind the build", d: "How the work stays clean", k: "backend server database api tests testing security clean code", run: go(ROOT + "build/#behind") },
    { g: "What I build", t: "Custom software", d: "Built around one daily job", k: "app web app portal mvp platform system", run: go(ROOT + "build/#software") },
    { g: "What I build", t: "Automation", d: "Busywork that runs itself", k: "automate workflow n8n zapier email follow-up integration", run: go(ROOT + "build/#automation") },
    { g: "What I build", t: "Websites & stores", d: "Sites and stores that sell", k: "website site store shop shopify landing page seo ecommerce", run: go(ROOT + "build/#websites") },
    { g: "Do", t: "Start a project", d: "Six short steps, one brief", k: "quote hire brief begin", run: () => openWizard() },
    { g: "Do", t: "Open quick view", d: "The whole studio on one screen", k: "overview summary", run: () => (CS.quickView ? CS.quickView() : (location.href = ROOT + "?view=quick")) },
    { g: "Do", t: "WordPress care plan", d: "Updates, backups, speed, fixes", k: "maintenance maintain monthly", run: () => openWizard("WordPress / WooCommerce", "", "Monthly care plan") },
    { g: "Do", t: "Email Chester", d: "chestercatapia08@gmail.com", k: "mail message", run: go("mailto:chestercatapia08@gmail.com") },
  ];
  const STOP = new Set(["a", "an", "and", "the", "for", "to", "of", "my", "our", "we", "i", "in", "on", "with", "that", "can", "need", "want", "is", "it", "me", "us"]);
  let shown = [];
  let active = 0;
  let opener = null;

  function renderPalette() {
    const q = pInput.value.trim();
    const words = q.toLowerCase().split(/\s+/).filter((w) => w.length > 1 && !STOP.has(w));
    // ranked by how many of the typed words each item knows, so "dashboard for stock" still finds Dashboards
    const hits = !q ? ITEMS : ITEMS
      .map((it) => {
        const name = it.t.toLowerCase();
        const hay = `${name} ${it.d} ${it.k}`.toLowerCase();
        // short words must match a whole word ("ai" is not in "email"); a word in the item's name counts double
        const has = (text, w) => (w.length > 3 ? text.includes(w) : new RegExp(`\\b${w.replace(/\W/g, "")}`).test(text));
        return { it, n: words.reduce((n, w) => n + (has(name, w) ? 2 : has(hay, w) ? 1 : 0), 0) };
      })
      .filter((x) => x.n > 0)
      .sort((a, b) => b.n - a.n)
      .map((x) => x.it);
    // a phrase that isn't a page is a project idea: offer it as the start of a brief,
    // first when it reads like a sentence, after the matches when it's a word or two
    const brief = q.length > 2
      ? { g: "Start a brief", t: `Start a project: “${q}”`, d: "Opens the intake with this as your brief", brief: true, run: () => openWizard(undefined, q) }
      : null;
    shown = !brief ? hits : q.split(/\s+/).length >= 3 || !hits.length ? [brief, ...hits] : [...hits, brief];
    active = Math.min(active, Math.max(0, shown.length - 1));
    let g = "";
    pList.innerHTML = shown.map((it, i) => {
      // ranked results mix groups, so a search shows one "Matches" heading
      const label = it.brief ? it.g : q ? "Matches" : it.g;
      const head = label !== g ? `<p class="palette__group" role="presentation">${(g = label)}</p>` : "";
      return `${head}<div class="palette__item${it.brief ? " is-brief" : ""}" role="option" id="pal-${i}" data-i="${i}" aria-selected="${i === active}">
        <b>${esc(it.t)}</b><span>${esc(it.d)}</span><i aria-hidden="true">${it.brief ? "↵" : "→"}</i></div>`;
    }).join("") || `<p class="palette__empty">Nothing matches. Try “dashboard”, “AI” or “WordPress”.</p>`;
    pInput.setAttribute("aria-activedescendant", shown.length ? `pal-${active}` : "");
  }
  function setActive(i) {
    if (!shown.length) return;
    active = (i + shown.length) % shown.length;
    pList.querySelectorAll(".palette__item").forEach((el) => el.setAttribute("aria-selected", el.dataset.i == active));
    pInput.setAttribute("aria-activedescendant", `pal-${active}`);
    document.getElementById(`pal-${active}`)?.scrollIntoView({ block: "nearest" });
  }
  function openPalette() {
    if (!palette.hidden) return;
    opener = document.activeElement;
    pInput.value = "";
    active = 0;
    renderPalette();
    palette.hidden = false;
    document.body.style.overflow = "hidden";
    void palette.offsetWidth; // apply the closed styles first, so the fade-in runs
    palette.classList.add("is-open");
    pInput.focus();
  }
  function closePalette(silent) {
    if (palette.hidden) return;
    palette.classList.remove("is-open");
    palette.hidden = true;
    document.body.style.overflow = "";
    if (!silent && opener && opener.focus) opener.focus();
  }
  function runItem(i) {
    const it = shown[i];
    if (!it) return;
    closePalette(true);
    it.run();
  }
  CS.openPalette = openPalette;

  document.querySelectorAll("[data-palette]").forEach((b) => b.addEventListener("click", openPalette));
  palette.addEventListener("click", (e) => {
    if (e.target.closest("[data-close]")) { closePalette(); return; }
    const it = e.target.closest(".palette__item");
    if (it) runItem(+it.dataset.i);
  });
  palette.addEventListener("mousemove", (e) => {
    const it = e.target.closest(".palette__item");
    if (it && +it.dataset.i !== active) setActive(+it.dataset.i);
  });
  pInput.addEventListener("input", () => { active = 0; renderPalette(); });
  pInput.addEventListener("keydown", (e) => {
    if (e.key === "ArrowDown") { e.preventDefault(); setActive(active + 1); }
    else if (e.key === "ArrowUp") { e.preventDefault(); setActive(active - 1); }
    else if (e.key === "Enter") { e.preventDefault(); runItem(active); }
    else if (e.key === "Escape") { e.preventDefault(); closePalette(); }
    else if (e.key === "Tab") { e.preventDefault(); setActive(active + (e.shiftKey ? -1 : 1)); }
  });
  // ⌘K / Ctrl+K anywhere, or "/" when not typing
  addEventListener("keydown", (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
      e.preventDefault();
      if (palette.hidden) { if (!wizard.classList.contains("is-open")) openPalette(); } else closePalette();
    } else if (e.key === "/" && palette.hidden && !wizard.classList.contains("is-open") && !e.target.closest("input, textarea, [contenteditable]")) {
      e.preventDefault();
      openPalette();
    }
  });

  CS.openWizard = openWizard;
})();
