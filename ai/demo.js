/* AI demos: scripted conversations from real builds, with the logic behind every reply.
   The scripts live in ai/cases.js (window.AI_CASES). Mount with <div class="aid" data-ai-demo></div>
   for all cases with tabs, or data-ai-demo="dental" for one. data-ai-hash keeps the open case in the URL. */
(() => {
  "use strict";

  const CASES = window.AI_CASES || [];
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const fmt = (s) => esc(s).replace(/\*\*(.+?)\*\*/g, "<b>$1</b>");
  const money = (n) => "$" + n.toFixed(n < 1 ? 3 : 2);
  const sleep = (ms) => new Promise((r) => setTimeout(r, reduce ? Math.min(ms, 120) : ms));

  const path = (d) => `<svg viewBox="0 0 24 24" aria-hidden="true">${d}</svg>`;
  const ICONS = {
    bag: path('<path d="M5 8h14l-1.2 12H6.2z"/><path d="M9 8V6a3 3 0 0 1 6 0v2"/>'),
    tooth: path('<path d="M7 3c-2.5 0-4 2-4 4.5 0 3 1.5 4.5 2 7.5.4 2.6 1 6 2.6 6 1.5 0 1.6-4 2.4-5.5.5-1 1.5-1 2 0 .8 1.5.9 5.5 2.4 5.5 1.6 0 2.2-3.4 2.6-6 .5-3 2-4.5 2-7.5C21 5 19.5 3 17 3c-2 0-3 1-5 1S9 3 7 3z"/>'),
    home: path('<path d="M3 11 12 4l9 7"/><path d="M5 10v10h14V10"/><path d="M10 20v-6h4v6"/>'),
    wrench: path('<path d="M14.7 6.3a4 4 0 0 0-5.4 5.2L3.5 17.3a1.8 1.8 0 0 0 2.5 2.5l5.8-5.8a4 4 0 0 0 5.2-5.4l-2.6 2.6-2.3-.4-.4-2.3z"/>'),
    radar: path('<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><path d="M12 12 18.5 5.5"/><circle cx="12" cy="12" r="1.2"/>'),
    play: path('<rect x="3" y="5" width="18" height="14" rx="3"/><path d="m10 9 5 3-5 3z"/>'),
  };
  const KIND = { understand: "Understood", check: "Checked", rule: "Rule", act: "Did", guard: "Guard", person: "Person", learn: "Learned" };

  // everyday things every assistant handles; a case can override any of these by defining the same id
  function common(c) {
    const team = c.team || "the team", by = c.replyBy || "soon";
    const handoff = (title) => ({ title, meta: `${team[0].toUpperCase() + team.slice(1)} · same thread`, pill: `Reply ${by}`, tone: "handoff" });
    return {
      _hi: { ask: "Hi!", keys: ["hi", "hello", "hey", "hiya", "howdy", "good morning", "good afternoon", "good evening"],
        beats: [{ trace: [["understand", "Greeting", "No question yet"], ["rule", "Lead with what people ask most", "Offer the top topics as buttons"]], say: "Hi! What can I help you with?" }] },
      _thanks: { ask: "Thanks!", keys: ["thanks", "thank you", "thx", "cheers", "appreciate it", "much appreciated", "perfect thanks"],
        beats: [{ trace: [["understand", "Thanks", "The question was answered"], ["act", "Marked resolved", "No follow-up needed"]], say: "You're welcome! Anything else I can help with?" }] },
      _human: { ask: "Can I talk to a real person?", chip: "Talk to a person", keys: ["real person", "a person", "human", "someone real", "staff member", "representative", "speak to someone", "talk to someone", "manager", "call me", "live agent", "operator"],
        beats: [{ trace: [["understand", "Wants a person", "Asked for one directly"], ["rule", "Always allowed", "Anyone can reach a person, no hoops"], ["act", "Handed off", `Chat and context sent to ${team}`]],
          say: `Of course. I've passed this chat to ${team} with everything so far, so you won't have to repeat yourself. They'll reply ${by}.`, card: handoff("Handed to a person") }] },
      _bot: { ask: "Are you a bot?", keys: ["bot", "robot", "are you ai", "are you an ai", "are you real", "are you human", "chatgpt", "automated", "a machine"],
        beats: [{ trace: [["understand", "Asks if it's AI", "Wants to know who they're talking to"], ["guard", "Honest about being AI", "Never pretends to be a person"]],
          say: `Yes, I'm an AI assistant. I answer from this business's own information, and ${team} can take over whenever you like.`, choices: [{ label: "Talk to a person", go: "_human" }] }] },
      _privacy: { ask: "What do you do with my info?", keys: ["privacy", "my data", "personal info", "personal information", "delete my", "who sees", "recorded", "gdpr", "my details", "is it safe"],
        beats: [{ trace: [["understand", "Privacy question", "Asks what happens to their messages"], ["guard", "Stays with the business", "Not used to train public AI models"], ["rule", "Deleted on request", "Chat and details removed when asked"]],
          say: "Your messages are only used to help you and stay with this business. They aren't used to train public AI models, and you can ask for this chat to be deleted any time." }] },
      _angry: { ask: "This is useless.", keys: ["useless", "stupid", "terrible", "worst", "ridiculous", "scam", "wtf", "hate this", "annoyed", "frustrated", "angry", "sucks", "waste of time", "not helpful"],
        beats: [{ trace: [["understand", "Frustrated", "Tone: angry"], ["rule", "Upset people get a person first", "No scripts, no selling"], ["act", "Priority handoff", `Flagged urgent for ${team}`], ["learn", "Logged for review", "The owner sees where the AI fell short"]],
          say: `I'm sorry, this hasn't been helpful. I've flagged the chat as a priority for ${team}, and a person will pick it up ${by}.`, card: handoff("Priority: a person is taking over") }] },
      _lang: { ask: "¿Hablas español?", keys: ["hola", "espanol", "español", "spanish", "habla", "hablas", "puedes", "necesito", "quiero", "gracias", "buenos dias", "buenas"],
        beats: [{ trace: [["understand", "Spanish detected", "The chat switches language from here"], ["check", "Languages the owner turned on", "English · Spanish"], ["guard", "Same rules in any language", "Facts come from the same business info"]],
          say: "¡Claro! Puedo ayudarte en español. ¿En qué te puedo ayudar?" }] },
      _bye: { ask: "That's all, bye!", keys: ["bye", "goodbye", "see you", "thats all", "nothing else", "all good", "talk later"],
        beats: [{ trace: [["act", "Chat closed", "Transcript saved for the team"], ["learn", "Summary written", "Whoever picks it up next knows the story"]], say: "Thanks for stopping by. If you come back, this chat will still be here." }] },
    };
  }

  // typed words → topics. Exact phrase 2, exact word 1, a word form or one-letter typo 0.7.
  const norm = (t) => ` ${t.toLowerCase().replace(/[’']/g, "").replace(/[^a-z0-9#$.ñáéíóú\s]+/g, " ").replace(/\s+/g, " ").trim()} `;
  // plurals and -ing/-ed, but never down to a scrap: "doing" must not become "do"
  const stem = (w) => { const s = w.replace(/(ing|ed|s)$/, ""); return s.length >= 3 ? s : w; };
  function near(a, b) {
    if (Math.abs(a.length - b.length) > 1) return false;
    let i = 0, j = 0, e = 0;
    while (i < a.length && j < b.length) {
      if (a[i] === b[j]) { i++; j++; continue; }
      if (++e > 1) return false;
      if (a.length > b.length) i++; else if (b.length > a.length) j++; else { i++; j++; }
    }
    return e + (a.length - i) + (b.length - j) <= 1;
  }
  // two neighbouring letters swapped: "szie" → "size"
  const swapped = (a, b) => {
    if (a.length !== b.length) return false;
    const d = [...a].map((ch, i) => (ch !== b[i] ? i : -1)).filter((i) => i >= 0);
    return d.length === 2 && d[1] === d[0] + 1 && a[d[0]] === b[d[1]] && a[d[1]] === b[d[0]];
  };
  // typos almost never hit the first letter, and allowing it turns "killing" into "filling"
  const like = (w, k) => w === k || (k.length >= 4 && (stem(w) === stem(k) || (w[0] === k[0] && swapped(w, k)))) || (k.length >= 5 && w[0] === k[0] && near(w, k));
  function fit(q, words, key) {
    const k = norm(key).trim();
    if (!k) return 0;
    if (k.includes(" ")) {
      if (q.includes(` ${k} `)) return 2;
      return k.split(" ").every((p) => words.some((w) => like(w, p))) ? 1.4 : 0;
    }
    if (words.includes(k) || (/\d/.test(k) && q.includes(k))) return 1;
    return k.length >= 4 && words.some((w) => like(w, k)) ? 0.7 : 0;
  }

  // white or ink text on the client's accent, whichever reads better
  function inkOn(hex) {
    const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255);
    const lum = 0.2126 * r ** 2.2 + 0.7152 * g ** 2.2 + 0.0722 * b ** 2.2;
    return lum > 0.3 ? "#16161a" : "#ffffff";
  }

  function card(c) {
    const steps = c.steps ? `<ol class="aid-card__steps">${c.steps.list.map((s, i) => `<li class="${i < c.steps.at ? "is-done" : i === c.steps.at ? "is-now" : ""}">${esc(s)}</li>`).join("")}</ol>` : "";
    const rows = c.rows ? `<dl class="aid-card__rows">${c.rows.map(([k, v]) => `<div><dt>${esc(k)}</dt><dd>${fmt(v)}</dd></div>`).join("")}</dl>` : "";
    const acts = c.actions ? `<div class="aid-choices">${c.actions.map((a) => `<button type="button" data-go="${esc(a.go)}">${esc(a.label)}</button>`).join("")}</div>` : "";
    return `<div class="aid-card aid-card--${c.tone || "plain"}">
      <div class="aid-card__top"><b>${esc(c.title)}</b>${c.pill ? `<span class="aid-card__pill">${esc(c.pill)}</span>` : ""}</div>
      ${c.meta ? `<p class="aid-card__meta">${esc(c.meta)}</p>` : ""}${steps}${rows}${acts}
    </div>`;
  }

  function mount(root) {
    const only = root.dataset.aiDemo;
    const list = only ? CASES.filter((c) => c.id === only) : CASES;
    if (!list.length) return;
    const useHash = "aiHash" in root.dataset;

    root.innerHTML = `
      ${list.length > 1 ? `<div class="aid__tabs" role="tablist" aria-label="AI builds">${list.map((c) => `
        <button type="button" role="tab" class="aid__tab" data-case="${c.id}" aria-selected="false" style="--acc:${c.accent}">${ICONS[c.icon] || ""}<span>${esc(c.tab)}</span></button>`).join("")}
      </div>` : ""}
      <div class="aid__stage">
        <div class="aid__site">
        <div class="aid__browser" aria-hidden="true"><i></i><i></i><i></i><span class="aid__url">${path('<rect x="6" y="11" width="12" height="9" rx="2"/><path d="M9 11V8a3 3 0 0 1 6 0v3"/>')}<b class="aid__domain"></b></span></div>
        <div class="aid__page"><img class="aid__shot" alt="" decoding="async" /></div>
        <section class="aid__chat" aria-label="Chat">
          <header class="aid__head">
            <span class="aid__avatar"></span>
            <div><b class="aid__name"></b><small class="aid__status"></small></div>
            <span class="aid__live">Demo</span>
          </header>
          <p class="aid__who"></p>
          <div class="aid__log" role="log" aria-live="polite"></div>
          <div class="aid__chips" aria-label="Suggestions"></div>
          <form class="aid__form" autocomplete="off">
            <input type="text" maxlength="200" aria-label="Type a message" placeholder="Type a message, or tap a suggestion" enterkeyhint="send" />
            <button type="submit" aria-label="Send">${path('<path d="M5 12h14M13 6l6 6-6 6"/>')}</button>
          </form>
        </section>
        </div>
        <aside class="aid__brain" aria-label="Under the hood">
          <header class="aid__brain-head"><span class="aid__pulse" aria-hidden="true"></span>Under the hood<span class="aid__count"></span></header>
          <ol class="aid__trace"></ol>
          <div class="aid__meter">
            <div class="aid__bill" role="group" aria-label="How the AI is paid for">
              <button type="button" data-bill="metered" aria-pressed="true">Pay-as-you-go</button>
              <button type="button" data-bill="plan" aria-pressed="false">Your Claude / Codex plan</button>
            </div>
            <div class="aid__meter-row"><span class="aid__meter-label"></span><b class="aid__spend"></b></div>
            <div class="aid__bar"><i></i></div>
            <div class="aid__meter-row"><span>This chat</span><b class="aid__chatcost"></b></div>
            <div class="aid__ctrl">
              <button type="button" class="aid__cap" aria-pressed="false">Use up the budget</button>
              <button type="button" class="aid__reset">Restart</button>
            </div>
          </div>
        </aside>
      </div>
      <div class="aid__foot">
        <div><p class="aid__pitch"></p><p class="aid__plan"></p></div>
        <button type="button" class="aid__build">Build this for my business <span aria-hidden="true">→</span></button>
      </div>
      <p class="aid__note">A scripted demo: every reply is written ahead from the real build’s flows. Nothing you type leaves this page.</p>`;

    const $ = (s) => root.querySelector(s);
    const log = $(".aid__log"), trace = $(".aid__trace"), chips = $(".aid__chips"), input = $(".aid__form input");
    let c, s, T, run = 0;
    const label = (id) => T[id].chip || T[id].ask;

    const scroll = (el) => el.scrollTo({ top: el.scrollHeight, behavior: reduce ? "auto" : "smooth" });

    function meter() {
      const pct = Math.min(100, (s.spent / c.budget.cap) * 100);
      // on the client's own subscription there's no per-reply bill, only how much of the plan's limit is used
      $(".aid__meter-label").textContent = s.plan ? "Claude / Codex plan usage" : "AI budget this month";
      $(".aid__spend").textContent = s.plan ? `${pct.toFixed(1)}% of limit` : `${money(s.spent)} of ${money(c.budget.cap)}`;
      $(".aid__bar i").style.width = pct + "%";
      $(".aid__meter").classList.toggle("is-capped", s.capped);
      $(".aid__chatcost").textContent = `${s.replies} ${s.replies === 1 ? "reply" : "replies"} · ${s.plan ? "$0 extra" : money(s.cost)}`;
      $(".aid__count").textContent = s.n ? `Reply ${s.n}` : "";
      root.querySelectorAll("[data-bill]").forEach((b) => b.setAttribute("aria-pressed", (b.dataset.bill === "plan") === s.plan));
      const cap = $(".aid__cap");
      cap.textContent = s.capped ? (s.plan ? "Reset the plan limit" : "Restore the budget") : (s.plan ? "Hit the plan limit" : "Use up the budget");
      cap.setAttribute("aria-pressed", s.capped);
    }

    function say(beat, who = beat.from || "ai") {
      const el = document.createElement("div");
      el.className = `aid-msg aid-msg--${who}`;
      if (who === "event") el.innerHTML = `<span>${fmt(beat.say)}</span>`;
      else {
        const label = who === "person" ? `<span class="aid-msg__who">${esc(beat.who || "Team")}</span>` : "";
        const bubble = beat.say ? `<div class="aid-msg__bubble">${label}${fmt(beat.say)}</div>` : "";
        const choices = beat.choices ? `<div class="aid-choices">${beat.choices.map((x) => `<button type="button" data-go="${esc(x.go)}">${esc(x.label)}</button>`).join("")}</div>` : "";
        el.innerHTML = bubble + (beat.card ? card(beat.card) : "") + choices;
      }
      log.append(el);
      scroll(log);
    }

    function step([kind, title, detail]) {
      const li = document.createElement("li");
      li.className = `aid-step aid-step--${kind}`;
      li.innerHTML = `<span class="aid-step__kind">${KIND[kind] || kind}</span><b>${esc(title)}</b><span class="aid-step__detail">${esc(detail || "")}</span>`;
      trace.append(li);
      scroll(trace);
    }

    function offer(ids) {
      // skip what the last message already offers as its own buttons
      const shown = new Set([...log.querySelectorAll(".aid-choices button:not(:disabled)")].map((b) => b.dataset.go));
      const more = c.menu && ids !== c.menu ? `<button type="button" class="aid__more" data-more>More questions</button>` : "";
      chips.innerHTML = ids.filter((id) => T[id] && !shown.has(id)).map((id) => `<button type="button" data-go="${id}">${esc(label(id))}</button>`).join("") + more;
    }

    // every topic the typed words touch, best first; on a tie a case topic beats an everyday one
    function rank(text) {
      const q = norm(text), words = q.trim().split(" ");
      const out = [];
      for (const [id, t] of Object.entries(T)) {
        let score = 0;
        const hit = [];
        for (const k of t.keys || []) {
          const f = fit(q, words, k);
          if (f) { score += f; hit.push(k); }
        }
        if (!score) continue;
        if (s.offered.includes(id)) score += 0.3;
        if (id[0] !== "_") score += 0.01;
        out.push({ id, hit, score });
      }
      return out.sort((a, b) => b.score - a.score);
    }

    // a reply the engine writes itself: one quick question when two topics fit equally well
    const clarify = (a, b) => ({
      beats: [{
        trace: [
          ["understand", "Two possible meanings", `“${a.hit[0]}” → ${label(a.id)} · “${b.hit[0]}” → ${label(b.id)}`],
          ["guard", "Ask, don't guess", "Low confidence → one quick question first"],
        ],
        say: `Just to be sure I help with the right thing: is this about **${label(a.id)}** or **${label(b.id)}**?`,
        choices: [{ label: label(a.id), go: a.id }, { label: label(b.id), go: b.id }],
      }],
      next: [],
    });

    async function play(topic, said, { matched, also } = {}) {
      const my = ++run;
      s.busy = true;
      s.n++;
      chips.innerHTML = "";
      log.querySelectorAll(".aid-choices button").forEach((b) => (b.disabled = true));
      if (!also) say({ say: said }, "user");

      const t = s.capped ? c.capped : topic;
      const head = document.createElement("li");
      head.className = "aid-step aid-step--head";
      head.innerHTML = `<span>${also ? "Also asked" : `Reply ${s.n}`}</span><q>${esc(also ? label(also) : said)}</q>`;
      trace.querySelector(".aid-step--empty")?.remove();
      trace.querySelectorAll(".aid-step").forEach((x) => x.classList.add("is-past"));
      trace.append(head);
      if (also) step(["understand", "Second question, same message", "Answering both, in the order asked"]);
      if (matched && !s.capped && t.ask) step(["understand", "Matched your words", `${matched.hit.slice(0, 3).map((k) => `“${k}”`).join(", ")} → ${t.chip || t.ask}`]);
      meter();

      for (const beat of t.beats) {
        if (beat.wait) await sleep(beat.wait);
        if (my !== run) return;
        if (beat.from === "user") { await sleep(600); if (my !== run) return; say(beat, "user"); continue; }
        const typing = beat.from === "event" ? null : document.createElement("div");
        if (typing) {
          typing.className = `aid-msg aid-msg--${beat.from || "ai"} aid-msg--typing`;
          typing.innerHTML = `<div class="aid-msg__bubble"><i></i><i></i><i></i></div>`;
          log.append(typing);
          scroll(log);
        }
        for (let st of beat.trace || []) {
          await sleep(380);
          if (my !== run) return;
          // the scripts word the pause as a money cap; on a subscription it's the plan's limit
          if (s.capped && s.plan && st === t.beats[0].trace?.[0] && st[0] === "guard") st = ["guard", "Plan limit reached", "Claude / Codex limit hit → AI pauses until it resets"];
          step(st);
        }
        await sleep(Math.min(1300, 350 + (beat.say || "").length * 6));
        if (my !== run) return;
        typing?.remove();
        say(beat);
        if ((beat.from || "ai") === "ai" && !s.capped) {
          s.replies++;
          if (!s.plan) s.cost += c.budget.per;
          s.spent += c.budget.per;
          meter();
        }
      }
      s.busy = false;
      offer(t.next || (s.capped ? [] : c.start));
      if (s.capped && !t.next) chips.innerHTML = `<button type="button" class="aid__restore">${s.plan ? "Reset the plan limit" : "Restore the budget"}</button>`;
      s.offered = t.next || c.start;
      return my === run;
    }

    function send(id, said) {
      if (s.busy) return;
      const t = id ? T[id] : c.fallback;
      if (t) play(t, said || t.ask);
    }

    // a typed message: one topic, two topics, a quick question, or "I'd rather not guess"
    async function typed(text) {
      if (s.busy) return;
      if (s.capped) return play(c.capped, text);
      let r = rank(text);
      // "hi, where's my order?" is about the order
      const soft = (x) => ["_hi", "_thanks", "_bye"].includes(x.id);
      if (r.some((x) => !soft(x))) r = r.filter((x) => !soft(x));
      const [a, b] = r;
      if (!a) return play(c.fallback, text);
      const apart = b && !b.hit.some((k) => a.hit.includes(k));
      const joined = /\band\b|\balso\b|\bplus\b|[,;]|\?\s*\S/.test(text);
      if (apart && !joined && a.id[0] !== "_" && b.id[0] !== "_" && a.score < 1.5 && b.score >= a.score - 0.05) return play(clarify(a, b), text, { matched: null });
      const two = apart && joined && b.score >= 0.7;
      if (await play(T[a.id], text, { matched: a }) && two) play(T[b.id], text, { matched: b, also: b.id });
    }

    function open(id) {
      run++;
      c = list.find((x) => x.id === id) || list[0];
      s = { spent: c.budget.spent, cost: 0, replies: 0, n: 0, capped: false, busy: false, offered: c.start, plan: c.billing === "plan" };
      T = { ...common(c), ...c.topics };
      root.style.setProperty("--acc", c.accent);
      root.style.setProperty("--acc-ink", inkOn(c.accent));
      root.querySelectorAll(".aid__tab").forEach((b) => b.setAttribute("aria-selected", b.dataset.case === c.id));
      // the assistant sits on the client's own site (name and logo blurred in the screenshot)
      const shot = $(".aid__shot");
      shot.src = `${document.documentElement.dataset.root || ""}public/projects/${c.site}`;
      shot.alt = `${c.tab} website with the assistant open`;
      $(".aid__domain").textContent = c.domain || "www.client-site.com";
      $(".aid__avatar").innerHTML = ICONS[c.icon] || "";
      $(".aid__name").textContent = c.name;
      $(".aid__status").textContent = c.status;
      $(".aid__who").textContent = c.who;
      $(".aid__pitch").textContent = c.pitch;
      $(".aid__plan").textContent = c.plan;
      log.innerHTML = "";
      trace.innerHTML = `<li class="aid-step aid-step--empty">Tap a suggestion or type a message. The reasoning behind each reply shows up here, step by step.</li>`;
      c.greeting.forEach((g) => say(g));
      offer(c.start);
      meter();
    }

    // other parts of the page can open a case and play one moment: a topic, a typed message, or the fallback
    root.aiPlay = (id, topic, said, { capped } = {}) => {
      open(id);
      if (useHash) history.replaceState(null, "", "#" + c.id);
      if (capped) {
        s.capped = true;
        s.spent = c.budget.cap;
        meter();
      }
      if (topic === "typed") return typed(said);
      const t = topic === "fallback" ? c.fallback : T[topic];
      if (t) play(t, said || t.ask);
    };

    root.addEventListener("click", (e) => {
      const tab = e.target.closest(".aid__tab");
      if (tab) {
        open(tab.dataset.case);
        if (useHash) history.replaceState(null, "", "#" + c.id);
        return;
      }
      const go = e.target.closest("[data-go]");
      if (go && !go.disabled) return send(go.dataset.go, go.closest(".aid__chips") ? null : go.textContent);
      if (e.target.closest("[data-more]")) return offer(c.menu);
      if (e.target.closest(".aid__cap, .aid__restore")) {
        if (s.busy) return;
        s.capped = !s.capped;
        s.spent = s.capped ? c.budget.cap : c.budget.spent + s.cost;
        trace.querySelector(".aid-step--empty")?.remove();
        step(s.capped
          ? (s.plan
            ? ["guard", "Plan limit reached", "Simulated: the Claude / Codex limit is used → the AI pauses, a person answers"]
            : ["guard", "Budget used up", `Simulated: ${money(c.budget.cap)} of ${money(c.budget.cap)} → the AI pauses, a person answers`])
          : ["guard", s.plan ? "Plan limit reset" : "Budget restored", "The AI is back on"]);
        meter();
        offer(s.capped ? c.start : s.offered);
        return;
      }
      const bill = e.target.closest("[data-bill]");
      if (bill) {
        const plan = bill.dataset.bill === "plan";
        if (s.busy || plan === s.plan) return;
        s.plan = plan;
        trace.querySelector(".aid-step--empty")?.remove();
        step(plan
          ? ["rule", "Billing: your plan", "Runs on the client's Claude or Codex subscription · no per-reply bill"]
          : ["rule", "Billing: pay-as-you-go", `About ${money(c.budget.per)} a reply · capped at ${money(c.budget.cap)} a month`]);
        meter();
        return;
      }
      if (e.target.closest(".aid__reset")) return open(c.id);
      if (e.target.closest(".aid__build")) window.CS?.openWizard?.("AI Automation", c.brief);
    });

    $(".aid__form").addEventListener("submit", (e) => {
      e.preventDefault();
      const text = input.value.trim();
      if (!text || s.busy) return;
      input.value = "";
      typed(text);
    });

    // keyboard: arrows move between tabs
    root.querySelector(".aid__tabs")?.addEventListener("keydown", (e) => {
      if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
      const tabs = [...root.querySelectorAll(".aid__tab")];
      const i = tabs.findIndex((t) => t.getAttribute("aria-selected") === "true");
      const next = tabs[(i + (e.key === "ArrowRight" ? 1 : -1) + tabs.length) % tabs.length];
      next.focus();
      next.click();
    });

    const fromHash = useHash && list.find((x) => "#" + x.id === location.hash);
    open(fromHash ? fromHash.id : list[0].id);
  }

  document.querySelectorAll("[data-ai-demo]").forEach(mount);
})();
