/* What I Build: tap a screen to see it full size, with the case it comes from.
   Every fact below is from the build itself (the same words the home page uses). */
(() => {
  "use strict";

  const CASES = {
    tapfour: {
      label: "Live product · tap4.ph", name: "Tapfour", service: "Business System", more: "../#work",
      who: "Shops and cafés with a Tapfour tap stand",
      problem: "Bills and supplier dues lived in a notebook, stock ran out before anyone noticed, and nobody could tell which branch was doing well.",
      built: "A tap on the stand opens the shop’s review page, menu or socials. Behind it, an owner dashboard for taps, menu, bills, stock, staff and branches, and an admin console, built end to end.",
      hood: "Edits go live on the next tap · Cloudflare Workers, D1, Shopify",
    },
    aegis: {
      label: "In-house product", name: "AegisLeadOS", service: "AI Automation", more: "../#work",
      problem: "Leads come in, then nobody follows up.",
      built: "Give it one order, like “capture 10 med spas in New York”. It finds the businesses, walks each website like a customer, diagnoses the revenue leak and drafts the outreach. A person approves every send.",
      hood: "1,231 passing tests · Swift shell, local Node core, React",
    },
    trader: {
      label: "In-house product", name: "Trader Journal", service: "Digital Product", more: "../#work",
      problem: "The numbers lived in five spreadsheets.",
      built: "Log a trade in one line, grade it in one tap, and the whole desk updates: P&L, streaks, the calendar and a session report. It never shows a number it made up.",
      hood: "Broker CSV imports · Vanilla JS, Node 22 on Vercel, PostgreSQL",
    },
    bookshop: {
      label: "Client build", name: "Miniature Bookshop", service: "Website", more: "../#work",
      problem: "A website that looks fine but doesn’t sell.",
      built: "A shelf builder for tiny books sold in sets of six, paid by GCash or bank transfer. Underneath, a strict money path: every cart repriced on the server and every order email sent exactly once.",
      hood: "92-check purchase test · Next.js 16, Tailwind 4, Postgres on Neon",
    },
    ulap: {
      label: "WooCommerce store", name: "Ulap Coffee Roasters", service: "WordPress / WooCommerce", more: "../wordpress/",
      who: "Shops that sell on WordPress",
      built: "A complete WooCommerce store for a Philippine coffee roaster: a custom block theme, a GCash, Maya and bank transfer plugin with receipt upload and one-click verify, and a brew calculator.",
      hood: "WordPress, WooCommerce, PHP, custom plugins",
    },
    realestate: {
      label: "Lead-to-booking automation", name: "Real estate automation", service: "AI Automation",
      who: "Real estate agents and teams",
      built: "A mobile-first system where every lead is captured, qualified by AI, followed up at once and booked, with a live pipeline dashboard.",
    },
    quoting: {
      label: "Quote follow-up automation", name: "Home-service quoting AI", service: "AI Automation",
      who: "HVAC, plumbing and roofing teams",
      built: "Estimate requests become booked jobs through instant SMS and email follow-ups, smart scheduling and a growth dashboard.",
    },
    store: {
      label: "AI store assistant", name: "Online store", service: "AI Automation",
      who: "Online stores",
      problem: "Sizing, stock and “where’s my order” questions pile up overnight.",
      built: "An assistant on the store that answers sizing, stock and shipping at any hour, tracks orders, and hands damaged-item cases to a person. Pay-as-you-go, with a cap the owner sets.",
    },
    dental: {
      label: "AI front desk", name: "Dental clinic", service: "AI Automation",
      who: "Clinics and practices",
      problem: "Patients ask to book after the desk has gone home.",
      built: "A front desk that answers questions, books open slots, sends reminders, and flags urgent pain to the desk. Synced to the clinic calendar.",
    },
    studio: {
      label: "AI content autopilot", name: "Content studio", service: "AI Automation",
      who: "Creators and content teams",
      built: "It spots what’s trending, writes and renders the video, posts at peak hours, and learns from the views. Runs on the client’s existing AI plan.",
    },
    mallnav: {
      label: "Indoor navigation product", name: "Indoor mall navigation", service: "Digital Product",
      who: "Malls and large venues",
      built: "Searchable directories, turn-by-turn wayfinding and store promos in a clean mobile experience, with a site that drives installs.",
    },
    mechanic: {
      label: "On-demand service product", name: "On-demand mechanic app", service: "Digital Product",
      who: "Service marketplace founders",
      built: "Customers book vetted repair pros, track them and pay in one flow, with a landing page built to convert.",
    },
    dealership: {
      label: "Dealership website", name: "Motorcycle dealership", service: "Website",
      who: "Local dealerships and resellers",
      built: "A trust-first site with live inventory, sold-unit proof, walkaround reels and a Messenger-first way to buy, with nationwide delivery.",
    },
    accounting: {
      label: "Professional services site", name: "Local accounting firm", service: "Website",
      who: "Accountants, lawyers and consultants",
      built: "Services, credentials and lead capture, designed to win serious clients.",
    },
  };
  const ROWS = [["who", "Built for"], ["problem", "The problem"], ["built", "What I built"], ["hood", "Under the hood"]];

  const $ = (id) => document.getElementById(id);
  const box = $("bpBox");
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  let set = [];
  let at = 0;

  function show(i) {
    at = (i + set.length) % set.length;
    const b = set[at];
    const c = CASES[b.dataset.case];
    const fig = b.closest("figure, .bp-case");
    $("bpBoxImg").src = b.dataset.full;
    $("bpBoxImg").alt = b.querySelector("img").alt;
    $("bpBoxCount").textContent = `${at + 1} / ${set.length}`;
    $("bpBoxLabel").textContent = c.label;
    $("bpBoxName").textContent = c.name;
    // this screen's own line, under the case name
    $("bpBoxScreen").textContent = fig.querySelector("figcaption span, h3 + p").textContent;
    $("bpBoxFacts").innerHTML = ROWS.filter(([k]) => c[k]).map(([k, t]) => `<dt>${t}</dt><dd>${esc(c[k])}</dd>`).join("");
    $("bpBoxStart").dataset.wizardService = c.service;
    $("bpBoxMore").hidden = !c.more;
    if (c.more) $("bpBoxMore").href = c.more;
    box.querySelector(".bp-box__nav").hidden = set.length < 2;
  }

  document.querySelectorAll(".bp-zoom").forEach((b) => {
    b.addEventListener("click", () => {
      // step through the screens of the same kind of work
      set = [...b.closest(".bp-cat").querySelectorAll(".bp-zoom")];
      show(set.indexOf(b));
      box.showModal();
    });
  });
  box.querySelectorAll("[data-step]").forEach((s) => s.addEventListener("click", () => show(at + +s.dataset.step)));
  box.addEventListener("keydown", (e) => {
    if (e.key === "ArrowRight") show(at + 1);
    if (e.key === "ArrowLeft") show(at - 1);
  });
  // a click on the dim area around the panel closes it
  box.addEventListener("click", (e) => { if (e.target === box) box.close(); });
  box.addEventListener("close", () => $("bpBoxImg").removeAttribute("src"));
  // the intake opens over the page, so the dialog steps aside first (site.js opens it on this same click)
  $("bpBoxStart").addEventListener("click", () => box.close());

  $("year").textContent = new Date().getFullYear();
})();
