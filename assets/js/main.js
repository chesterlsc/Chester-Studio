/* ============================================================
   CHESTER STUDIO :: interactions
   Vanilla JS. No dependencies, no build step.
   ============================================================ */

(() => {
  "use strict";

  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const isFinePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

  /* ==========================================================
     PROJECT DATA
     ========================================================== */
  const PROJECTS = [
    {
      name: "AegisLeadOS",
      type: "Native macOS Operator Console",
      category: "AI Systems",
      image: "public/projects/aegis-leados.jpg",
      flagship: true,
      audience: "Agencies and operators selling to local businesses",
      proves: "I ship real products, not just sites: evidence-first AI with a human gate on every send",
      desc: "My own product, designed and engineered end to end at Chester Studio. A Mac-native operator console for lead generation: AEGIS walks a business's website the way a customer would, records what it actually sees, diagnoses the revenue leak, scores every lead 0 to 6, and drafts outreach that ships only after human approval, then tracks the replies. Swift shell, local Node core, React front end, deck.gl territorial atlas, and a voice-commandable AI console. 1,231 passing tests.",
      tags: ["macOS", "AI", "Lead Gen", "deck.gl", "Voice"],
      spotlight: {
        railId: "AEGIS//OPS",
        railStatus: 'CHESTER STUDIO<span class="fs__statusextra"> // IN-HOUSE PRODUCT</span>',
        standfirst: "AegisLeadOS is my own product, designed and engineered end to end at Chester Studio. You give it one order, <em>“capture 10 med spas in New York”</em>, and it sweeps the market, walks each prospect's site the way a customer would, diagnoses the revenue leak, and drafts the outreach for a human to approve before anything sends. Same play for HVAC, roofing, dental, or any local service market.",
        redact: "DEMO RECORDS BLURRED",
        feeds: [
          { label: "FEED 01 // CAPTURE.RUN", cap: "FEED 01 // CAPTURE.RUN · “10 MED SPAS, NEW YORK”", aria: "live capture run on the territorial atlas", poster: "public/projects/aegis-leados-capture.jpg", webm: "public/projects/aegis-feed-01.webm", mp4: "public/projects/aegis-feed-01.mp4" },
          { label: "FEED 02 // WORKFLOW.LIVE", cap: "FEED 02 // WORKFLOW.LIVE · LEADS IN MOTION", aria: "live capture workflow", poster: "public/projects/aegis-leados-workflow.jpg", webm: "public/projects/aegis-feed-02.webm", mp4: "public/projects/aegis-feed-02.mp4" },
          { label: "FEED 03 // OPS.PIPELINE", cap: "FEED 03 // OPS.PIPELINE · MID-SWEEP", aria: "operations and captured pipeline", poster: "public/projects/aegis-leados-pipeline.jpg", webm: "public/projects/aegis-feed-03.webm", mp4: "public/projects/aegis-feed-03.mp4" },
        ],
        how: [
          { t: "Pick a market", d: "HVAC, roofing, med spa, dental. Any local service, any US city." },
          { t: "AI sweeps the map", d: "Finds real businesses, then walks each website like a customer would." },
          { t: "Workflow qualifies", d: "Evidence, demand checks, and a live revenue leak diagnosis." },
          { t: "You approve", d: "Human verification gates every send. Nothing goes out on its own." },
          { t: "Start the outreach", d: "Scored, diagnosed, and drafted in your pipeline. You send when ready." },
        ],
        howAt: [0, 6, 21.3, 33.5, 42],
        feedStep: [null, 2, 4],
        telemetry: ["1,231 TESTS PASSING", "LEADS SCORED 0–6", "EVERY SEND HUMAN-GATED", "VOICE-COMMANDABLE"],
        typeExtra: " · Swift shell · local Node core · deck.gl atlas",
        cta: "OPEN CASE FILE",
      },
    },
    {
      name: "Trader Journal",
      type: "Trading Journal Platform",
      category: "Digital Products",
      image: "public/projects/trader-journal.jpg",
      flagship: true,
      audience: "Retail and funded traders",
      proves: "I trade through my own tools, and the analytics never overclaim",
      desc: "My own product, at 2.0, designed and engineered end to end at Chester Studio. Log a trade in seconds or drop in a TopstepX, Vantage, or Binance CSV, and the whole desk reacts: equity curve, win rate, R-multiples, a calendar of green and red days, and a timing almanac that maps your edge by weekday and hour. Any cell without enough trades behind it stays withheld, never estimated. Vanilla JS with no build step, Node 22 on Vercel, PostgreSQL underneath.",
      tags: ["Trading", "Analytics", "Vanilla JS", "PostgreSQL", "CSV Import"],
      spotlight: {
        railId: "TJ//DESK",
        railStatus: 'CHESTER STUDIO<span class="fs__statusextra"> // IN-HOUSE PRODUCT · V2.0</span>',
        standfirst: "Trader Journal is my own product, at 2.0, designed and engineered end to end at Chester Studio. Log a trade in seconds, or drop in a <em>TopstepX, Vantage, or Binance CSV</em>, and the whole desk reacts: equity curve, win rate, R-multiples, a calendar of green and red days, and a timing almanac that maps your edge by weekday and hour and stays silent on any cell until enough trades back it up. Numbers you can act on, never numbers it made up.",
        redact: "SAMPLE TRADES · DEMO MODE",
        feeds: [
          { label: "FEED 01 // LOG.TRADE", cap: "FEED 01 // LOG.TRADE · “ONE TRADE IN, EVERY NUMBER MOVES”", aria: "logging a trade and watching the desk react", poster: "public/projects/trader-journal-log.jpg", webm: "public/projects/trader-feed-01.webm", mp4: "public/projects/trader-feed-01.mp4" },
          { label: "FEED 02 // CALENDAR.DRILL", cap: "FEED 02 // CALENDAR.DRILL · GREEN DAY, FILTERED JOURNAL, CSV IMPORT", aria: "calendar drill-down and broker CSV import", poster: "public/projects/trader-journal-calendar.jpg", webm: "public/projects/trader-feed-02.webm", mp4: "public/projects/trader-feed-02.mp4" },
          { label: "FEED 03 // TIMING.ALMANAC", cap: "FEED 03 // TIMING.ALMANAC · WITHHELD UNTIL PROVEN", aria: "the timing almanac", poster: "public/projects/trader-journal-timing.jpg", webm: "public/projects/trader-feed-03.webm", mp4: "public/projects/trader-feed-03.mp4" },
        ],
        how: [
          { t: "Log the trade", d: "Symbol, long or short, entry, stop. Pick 0.5, 1 or 2 percent risk and it sizes the position." },
          { t: "Close and grade it", d: "Exit price, mood, execution grade, one note. Screenshots attach as evidence." },
          { t: "The desk reacts", d: "Net P&L, today, the equity curve and the calendar day update the moment you save." },
          { t: "Drill any day", d: "Click a calendar day to land in the journal filtered to it. Broker CSVs import beside it, with undo." },
          { t: "Read the almanac", d: "Expectancy by weekday and hour. A cell stays withheld until enough trades prove it." },
        ],
        howAt: [0, 18.1, 32.6, 36, 40.8],
        feedStep: [null, 3, 4],
        telemetry: ["TOPSTEPX · VANTAGE · BINANCE CSV IMPORT", "LIVE PRICES · BINANCE / COINGECKO / GOLD-API", "THIN CELLS WITHHELD, NEVER ESTIMATED", "NO BUILD STEP · ZERO DEPENDENCIES"],
        typeExtra: " · Vanilla JS · Node 22 on Vercel · PostgreSQL",
        cta: "OPEN THE LEDGER",
      },
    },
    {
      name: "The Little Bookshop",
      type: "Custom Ecommerce Storefront",
      category: "Websites",
      image: "public/projects/little-bookshop.jpg",
      flagship: true,
      audience: "Small makers who have outgrown marketplace templates",
      proves: "Storybook charm on the surface, a strict money path underneath",
      desc: "A client storefront for miniature bookshelves and tiny books sold in sets of six, built from scratch in Next.js instead of bending a Shopify theme. Customers pick a shelf, type six titles and watch a hand-drawn shelf fill spine by spine, then the bundle lands in a basket that remembers it. Every cart is repriced on the server, every order gets a number the customer can quote, the shop is paid the way it already sells on Instagram, by GCash or MariBank transfer, and both order emails go out exactly once. A 36-check Playwright smoke suite guards the whole path.",
      tags: ["Ecommerce", "Next.js", "Illustration", "Postgres", "Playwright"],
      spotlight: {
        railId: "BOOKSHOP//STORE",
        railStatus: 'CHESTER STUDIO<span class="fs__statusextra"> // CLIENT BUILD</span>',
        standfirst: "The Little Bookshop sells miniature bookshelves and tiny books in sets of six, so its store had to feel handmade too. I built it from scratch in Next.js rather than bending a Shopify theme: a customer picks a shelf, <em>types six titles and watches a hand-drawn shelf fill spine by spine</em>, then the bundle lands in a basket that remembers it. Underneath the charm the money path is strict. Every cart is repriced on the server, every order gets a number the customer can quote, and the shop is paid the way it already sells on Instagram, by GCash or MariBank transfer, with no gateway fees and no card ever collected.",
        redact: "DEV MAIL OUTBOX · NO LIVE ORDERS",
        feeds: [
          { label: "FEED 01 // BUILD.SHELF", cap: "FEED 01 // BUILD.SHELF · “SIX TITLES, ONE TINY SHELF”", aria: "building a little shelf from six titles", poster: "public/projects/little-bookshop-build.jpg", webm: "public/projects/bookshop-feed-01.webm", mp4: "public/projects/bookshop-feed-01.mp4" },
          { label: "FEED 02 // MONEY.PATH", cap: "FEED 02 // MONEY.PATH · BASKET TO PAYMENT SCREEN", aria: "checkout to the payment instructions screen", poster: "public/projects/little-bookshop-money.jpg", webm: "public/projects/bookshop-feed-02.webm", mp4: "public/projects/bookshop-feed-02.mp4" },
          { label: "FEED 03 // CATALOG.LIVE", cap: "FEED 03 // CATALOG.LIVE · NINE COLORS, SIX LITTLE BOOKS", aria: "the catalog and product pages", poster: "public/projects/little-bookshop-catalog.jpg", webm: "public/projects/bookshop-feed-03.webm", mp4: "public/projects/bookshop-feed-03.mp4" },
        ],
        how: [
          { t: "Pick a shelf", d: "Classic, Arched or Scalloped. Two sizes, nine colors, every one printed to order." },
          { t: "Type six titles", d: "A hand-drawn shelf fills spine by spine as the customer types. Six, always: UI, cart and server agree." },
          { t: "Dress the shelf", d: "A plant, a ladder, shelf letters, a theme, a note. Progress saves itself if they wander off." },
          { t: "Into the basket", d: "One bundle, six titles and all. The basket persists, and the browser never decides a price." },
          { t: "Pay by transfer", d: "GCash or MariBank with one-tap copy and an order number to quote on Instagram. The shop confirms by hand." },
        ],
        howAt: [0, 18.4, 35.1, 46.8, 50.4],
        feedStep: [null, 4, 0],
        telemetry: ["GCASH · MARIBANK MANUAL TRANSFER", "EVERY CART REPRICED SERVER-SIDE", "GMAIL SMTP · RESEND, SENT ONCE", "36-CHECK PLAYWRIGHT SMOKE"],
        typeExtra: " · Next.js 16 · Tailwind 4 · Postgres on Neon",
        cta: "OPEN CASE FILE",
      },
    },
    {
      name: "PukPok Workz",
      type: "Dealership Sales Website",
      category: "Websites",
      image: "public/projects/pukpok-workz.jpg",
      audience: "Local dealerships and resellers",
      proves: "Trust-first design sells high-ticket inventory",
      desc: "A trust-first site for a Parañaque motorcycle dealership. Live inventory, sold-unit proof, walkaround reels, and a Messenger-first buying flow with nationwide delivery.",
      tags: ["Branding", "Inventory", "Mobile", "Conversion"],
    },
    {
      name: "NAMI Studio",
      type: "Creative Studio Brand Site",
      category: "Websites",
      image: "public/projects/nami-studio.jpg",
      audience: "Studios and personal brands",
      proves: "Design taste that makes a brand feel premium",
      desc: "A creative studio site with personality. Motion, typography, and a portfolio grid that lets the work speak for itself.",
      tags: ["Creative", "Motion", "Portfolio"],
    },
    {
      name: "EstateOps AI",
      type: "Lead-to-Booking Automation",
      category: "AI Systems",
      image: "public/projects/estateops-ai.jpg",
      audience: "Real estate agents and teams",
      proves: "Leads captured, qualified, and booked with no manual chase",
      desc: "A mobile-first automation system for real estate agents. Every lead captured, qualified by AI, followed up instantly, and booked on autopilot, with a live pipeline dashboard.",
      tags: ["AI", "Automation", "Real Estate", "Mobile"],
    },
    {
      name: "QuoteFlow AI",
      type: "Quote Follow-up Automation",
      category: "AI Systems",
      image: "public/projects/quoteflow-ai.jpg",
      audience: "HVAC, plumbing, and roofing teams",
      proves: "Instant follow-ups turn estimates into booked jobs",
      desc: "A SaaS platform for home service companies. Estimate requests become booked jobs through instant SMS and email follow-ups, smart scheduling, and a real-time growth dashboard.",
      tags: ["AI", "SaaS", "Follow-ups", "Dashboard"],
    },
    {
      name: "Nexus Creative House",
      type: "Agency Brand Site",
      category: "Growth Work",
      image: "public/projects/nexus-creative.jpg",
      audience: "Agencies and talent brands",
      proves: "Editorial positioning that commands premium rates",
      desc: "A black-and-gold creative agency site. Talent management, campaign production, and brand strategy told with editorial confidence and world-class social proof.",
      tags: ["Branding", "Agency", "Editorial", "Talent"],
    },
    {
      name: "Parea Collective",
      type: "Business Ecosystem Hub",
      category: "Growth Work",
      image: "public/projects/parea-collective.jpg",
      audience: "Multi-brand operators",
      proves: "Complex ecosystems made clear enough to sell",
      desc: "The operating layer of modern business. An ecosystem site mapping how Aegis & Co, NAMI Studio, PCAA, and acquisitions feed one system, with a live input-to-output diagram.",
      tags: ["Ecosystem", "Positioning", "Systems"],
    },
    {
      name: "Aegis & Co",
      type: "Revenue Systems Site",
      category: "Growth Work",
      image: "public/projects/aegis-co.jpg",
      audience: "Service businesses with messy operations",
      proves: "Positioning plus a diagnostic that turns visitors into intake",
      desc: "The Aegis & Co site. Sharp positioning, a revenue-leak diagnostic, and a live workflow demo that shows service businesses exactly what gets fixed.",
      tags: ["Positioning", "Systems", "Conversion"],
    },
    {
      name: "J.A.R.V.I.S",
      type: "Personal AI Assistant",
      category: "AI Systems",
      image: "public/projects/jarvis.jpg",
      audience: "Anyone who wants AI beyond a chatbot",
      proves: "Voice, vision, and local control built from scratch",
      desc: "A JARVIS-style personal AI assistant with a cinematic HUD. Wake-word voice control, live system stats, weather, camera feed, and a conversational interface running locally.",
      tags: ["AI", "Voice", "Dashboard", "Python"],
    },
    {
      name: "GarageAI",
      type: "AI Diagnostics Tool",
      category: "AI Systems",
      image: "public/projects/garage-ai.jpg",
      audience: "Auto shops and garages",
      proves: "AI applied to a messy real-world trade",
      desc: "AI-powered vehicle diagnostics that helps garages triage faster. Symptoms in, ranked causes and repair guidance out.",
      tags: ["AI", "Diagnostics", "Product"],
    },
    {
      name: "Cleopatra Casino",
      type: "Live Gaming Platform",
      category: "Digital Products",
      image: "public/projects/cleopatra-casino.jpg",
      audience: "Product founders who need real-time logic",
      proves: "Live state, money math, and polish under pressure",
      desc: "A full live blackjack platform. Solo and multi-seat tables, four side bets, drag-and-drop chips, free-bet mode, bet history, and real-time dealer logic under a polished brand.",
      tags: ["Game", "Real-time", "Product", "UI"],
    },
    {
      name: "Parea Intake",
      type: "Guided Intake Experience",
      category: "Websites",
      image: "public/projects/parea-intake.jpg",
      audience: "Anyone replacing a dead contact form",
      proves: "Forms convert when they feel like a conversation",
      desc: "An 8-step guided intake that replaces the contact form. One question at a time, editorial typography, and routing that sends every inquiry to the right place.",
      tags: ["UX", "Wizard", "Forms", "Conversion"],
    },
    {
      name: "Greenfield Accounting",
      type: "Professional Services Site",
      category: "Websites",
      image: "public/projects/greenfield-accounting.jpg",
      audience: "Accountants, lawyers, and consultants",
      proves: "Credibility design that wins serious clients",
      desc: "A trust-first website for an accounting firm. Services, credentials, and lead capture designed to convert serious clients.",
      tags: ["Corporate", "Lead Gen", "SEO"],
    },
    {
      name: "FixIt",
      type: "On-demand Service Product",
      category: "Digital Products",
      image: "public/projects/fixit-app-mockup.jpg",
      audience: "Service marketplace founders",
      proves: "Booking, tracking, and payments in one flow",
      desc: "An on-demand home service platform connecting customers with vetted repair pros. Booking, tracking, and payments end to end, with a landing page built to convert.",
      tags: ["Mobile", "Marketplace", "UX"],
    },
    {
      name: "Mall Maps",
      type: "Indoor Navigation Product",
      category: "Digital Products",
      image: "public/projects/mall-maps-app-mockup.jpg",
      audience: "Malls and large venues",
      proves: "Complex wayfinding made simple on mobile",
      desc: "Indoor navigation for malls. Searchable directories, turn-by-turn wayfinding, and store promos in a clean mobile experience, backed by a marketing site that drives installs.",
      tags: ["Mobile", "Maps", "Product"],
    },
    {
      name: "PetMates",
      type: "Community Matching Product",
      category: "Digital Products",
      image: "public/projects/petmates-v1.jpg",
      audience: "Community and social founders",
      proves: "Matching, profiles, and chat people enjoy using",
      desc: "A pet matching product connecting owners for playdates, breeding, and adoption. Profiles, matching, and chat built in, with a playful public site that recruits early adopters.",
      tags: ["Product", "Matching", "Community"],
    },
  ];

  const TOOLS = [
    { name: "n8n", icon: "n8n", color: "#EA4B71" },
    { name: "VS Code", icon: "vscode", color: "#007ACC" },
    { name: "PostgreSQL", icon: "postgresql", color: "#4a7fe8" },
    { name: "MongoDB", icon: "mongodb", color: "#47A248" },
    { name: "React", icon: "react", color: "#61DAFB" },
    { name: "JavaScript", icon: "javascript", color: "#F7DF1E" },
    { name: "Python", icon: "python", color: "#5c9fd6" },
    { name: "Zapier", icon: "zapier", color: "#FF4F00" },
    { name: "Railway", icon: "railway", color: "#c9ccd4" },
    { name: "Supabase", icon: "supabase", color: "#3ECF8E" },
    { name: "OpenAI", icon: "openai", color: "#10A37F" },
    { name: "Claude", icon: "claude", color: "#D97757" },
    { name: "Codex", icon: "openai", color: "#c9ccd4" },
    { name: "Figma", icon: "figma", color: "#F24E1E" },
    { name: "Meta Ads", icon: "meta", color: "#3b82f6" },
    { name: "Amazon", icon: "amazon", color: "#FF9900" },
    { name: "REST APIs", short: "API", color: "#8B5CF6" },
    { name: "Next.js", icon: "nextdotjs", color: "#c9ccd4" },
    { name: "Tailwind CSS", icon: "tailwindcss", color: "#38BDF8" },
    { name: "GitHub", icon: "github", color: "#c9ccd4" },
    { name: "Vercel", icon: "vercel", color: "#c9ccd4" },
  ];

  // per-project accent, pulled from each build's own artwork
  const ACCENTS = {
    "AegisLeadOS": "#33d6e2",
    "PukPok Workz": "#ff4d4d",
    "Trader Journal": "#ff6a2b",
    "The Little Bookshop": "#ffab98",
    "NAMI Studio": "#a78bfa",
    "EstateOps AI": "#4aa8ff",
    "QuoteFlow AI": "#ff8a3d",
    "Nexus Creative House": "#d4a24c",
    "Parea Collective": "#d8b45a",
    "Aegis & Co": "#2f7dff",
    "J.A.R.V.I.S": "#3fd8f0",
    "GarageAI": "#4ade80",
    "Cleopatra Casino": "#52e0a4",
    "Parea Intake": "#d8b45a",
    "Greenfield Accounting": "#34d399",
    "FixIt": "#22c55e",
    "Mall Maps": "#38bdf8",
    "PetMates": "#fb923c",
  };
  PROJECTS.forEach((p) => {
    p.accent = ACCENTS[p.name] || "#178bff";
    p.slug = p.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  });

  const DESKTOP_CAP = 9; // three flagships + two clean rows of 3

  /* ==========================================================
     RENDER: PROJECT GRID
     ========================================================== */
  const grid = document.getElementById("workGrid");

  // Flagship spotlight: rail, standfirst, live footage stage, HOW IT WORKS, telemetry.
  // Everything comes from p.spotlight so any project can carry the treatment.
  const flagshipHTML = (p, seq) => {
    const sp = p.spotlight;
    const feeds = sp.feeds.map((f, i) => `
          <button class="fs__feed${i === 0 ? " is-live" : ""}" type="button" data-feed="${i}" aria-label="Show feed ${i + 1}: ${f.aria}">
            <img src="${f.poster}" alt="" loading="lazy" /><span class="fs__pill fs__feedcap">${f.label}</span>
          </button>`).join("");
    const how = sp.how.map((h, i) => `
          <li><button type="button" data-step="${i}" aria-label="Step ${i + 1}: ${h.t}. Jump footage to this step"><b>0${i + 1}</b><span><strong>${h.t}</strong><small>${h.d}</small></span></button></li>`).join("");
    const chips = sp.telemetry.map((c, i) => `<span style="--i:${i}">${c}</span>`).join("\n        ");
    return `
      <div class="fs__rail" aria-hidden="true">
        <span class="fs__id"><i></i>${sp.railId}<span class="fs__idextra"> · FLAGSHIP ${seq}</span></span>
        <span class="fs__status" title="Built in-house by Chester Studio">${sp.railStatus}</span>
        <span class="fs__clock">--:--:--Z</span>
      </div>
      <p class="fs__standfirst">${sp.standfirst}</p>
      <div class="fs__stage">
        <figure class="fs__main">
          <video class="fs__video" muted playsinline preload="none" disablepictureinpicture
            poster="${sp.feeds[0].poster}" aria-label="${p.name} screen capture">
            <source src="${sp.feeds[0].webm}" type="video/webm" />
            <source src="${sp.feeds[0].mp4}" type="video/mp4" />
          </video>
          <span class="fs__scan" aria-hidden="true"></span>
          <span class="project__shine" aria-hidden="true"></span>
          <span class="project__spot" aria-hidden="true"></span>
          <div class="fs__hud" aria-hidden="true">
            <span class="fs__pill fs__rec"><i></i>REC · FIELD CAPTURE</span>
            <span class="fs__pill fs__tc">TC 00:00 · LOOP</span>
          </div>
          <div class="fs__hud fs__hud--bottom" aria-hidden="true">
            <span class="fs__pill fs__cap">${sp.feeds[0].cap}</span>
            <span class="fs__pill fs__redact">${sp.redact}</span>
          </div>
        </figure>
        <aside class="fs__feeds">${feeds}
        </aside>
      </div>
      <div class="fs__how" aria-label="How ${p.name} works, synced to the footage">
        <span class="fs__howlabel">HOW IT WORKS<em>follows the footage, tap a step to jump</em></span>
        <ol class="fs__howsteps">${how}
        </ol>
      </div>
      <div class="fs__telemetry" aria-hidden="true">
        ${chips}
      </div>
      <div class="project__body">
        <div>
          <h3 class="project__name">${p.name}</h3>
          <p class="project__type">${p.type}<span class="fs__typeextra">${sp.typeExtra}</span></p>
        </div>
        <span class="fs__cta">${sp.cta} <b>↗</b></span>
      </div>`;
  };

  let flagshipSeq = 0;
  PROJECTS.forEach((p, i) => {
    const card = document.createElement("article");
    card.className = p.flagship ? "project project--flagship" : "project";
    const seq = p.flagship ? String(++flagshipSeq).padStart(3, "0") : null;
    card.dataset.category = p.category;
    card.dataset.index = i;
    card.setAttribute("data-reveal", "");
    card.style.setProperty("--d", `${(i % 3) * 0.08}s`);
    card.style.setProperty("--accent", p.accent);
    card.innerHTML = p.flagship ? flagshipHTML(p, seq) : `
      <div class="project__media">
        <div class="project__chrome" aria-hidden="true">
          <i></i><i></i><i></i>
          <span class="project__url"><b></b>/${p.slug}</span>
          <span class="project__num">${String(i + 1).padStart(2, "0")}</span>
        </div>
        <div class="project__shot">
          <img src="${p.image}" alt="${p.name}, ${p.type}" loading="lazy" />
          <span class="project__shine" aria-hidden="true"></span>
          <span class="project__spot" aria-hidden="true"></span>
        </div>
        <span class="project__cat">${p.category}</span>
      </div>
      <div class="project__body">
        <div>
          <h3 class="project__name">${p.name}</h3>
          <p class="project__type">${p.type}</p>
        </div>
        <span class="project__arrow" aria-hidden="true">↗</span>
      </div>`;
    card.addEventListener("click", () => openModal(i));
    // tall screenshots slow-pan top→bottom on hover instead of cropping forever
    if (!p.flagship) {
      const im = card.querySelector("img");
      const markTall = () => {
        if (im.naturalWidth && im.naturalHeight / im.naturalWidth > 0.85) card.classList.add("is-tall");
      };
      im.complete ? markTall() : im.addEventListener("load", markTall, { once: true });
    }
    grid.appendChild(card);
  });

  // flagship rail clocks: real time, UTC, always ticking (content, not motion)
  const fsClocks = document.querySelectorAll(".fs__clock");
  if (fsClocks.length) {
    const tickClock = () => {
      const t = new Date().toISOString().slice(11, 19) + "Z";
      fsClocks.forEach((c) => { c.textContent = t; });
    };
    tickClock();
    setInterval(tickClock, 1000);
  }

  /* ==========================================================
     FLAGSHIP LIVE FOOTAGE: one video per card, src-swap on a
     signal-drop cut, broadcast rotation, HOW steps synced to time
     ========================================================== */
  const initSpotlight = (fsCard, p) => {
    const sp = p.spotlight;
    const fsVideo = fsCard.querySelector(".fs__video");
    if (!fsVideo) return;
    const fsMain = fsVideo.parentElement;
    const fsTc = fsCard.querySelector(".fs__tc");
    const fsCap = fsCard.querySelector(".fs__cap");
    const feedBtns = [...fsCard.querySelectorAll(".fs__feed")];
    const howSteps = [...fsCard.querySelectorAll(".fs__howsteps button")];
    let currentFeed = 0;
    let userTookOver = false;
    let fsInView = false;
    let playPill = null;
    let howIdx = -1;

    const wantsPlay = () => (prefersReducedMotion ? playPill && playPill.classList.contains("is-playing") : fsInView);

    const setHowStep = (idx) => {
      if (idx === howIdx) return;
      howIdx = idx;
      howSteps.forEach((b, i) => b.parentElement.classList.toggle("is-now", i === idx));
    };
    // feed 0 syncs by timecode; other feeds pin the step they demonstrate
    const syncHow = () => {
      if (currentFeed !== 0) { setHowStep(sp.feedStep[currentFeed] ?? -1); return; }
      const t = fsVideo.currentTime;
      let idx = 0;
      for (let i = 0; i < sp.howAt.length; i++) if (t >= sp.howAt[i]) idx = i;
      setHowStep(idx);
    };

    const setFeed = (idx, cut) => {
      currentFeed = idx;
      const f = sp.feeds[idx];
      feedBtns.forEach((b, i) => b.classList.toggle("is-live", i === idx));
      if (fsCap) fsCap.textContent = f.cap;
      fsVideo.poster = f.poster; // poster first: a slow load shows the right still, never black
      fsVideo.innerHTML = `<source src="${f.webm}" type="video/webm" /><source src="${f.mp4}" type="video/mp4" />`;
      fsVideo.load();
      if (cut && !prefersReducedMotion) {
        fsMain.classList.remove("is-cutting");
        void fsMain.offsetWidth;
        fsMain.classList.add("is-cutting");
        fsMain.addEventListener("animationend", () => fsMain.classList.remove("is-cutting"), { once: true });
      }
      if (wantsPlay()) fsVideo.play().catch(() => {});
      syncHow();
    };

    // broadcast rotation: each feed plays to the end, then the next cuts in.
    // A manually chosen feed loops itself instead of rotating on.
    fsVideo.addEventListener("ended", () => {
      if (userTookOver) {
        fsVideo.currentTime = 0;
        fsVideo.play().catch(() => {});
        return;
      }
      setFeed((currentFeed + 1) % sp.feeds.length, true);
    });

    feedBtns.forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.stopPropagation(); // feed switching is navigation, not a modal open
        userTookOver = true;
        setFeed(parseInt(btn.dataset.feed, 10), true);
      });
    });

    howSteps.forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        userTookOver = true;
        const idx = parseInt(btn.dataset.step, 10);
        if (currentFeed !== 0) setFeed(0, true);
        const seek = () => { fsVideo.currentTime = sp.howAt[idx]; fsVideo.play().catch(() => {}); setHowStep(idx); };
        fsVideo.readyState >= 1 ? seek() : fsVideo.addEventListener("loadedmetadata", seek, { once: true });
      });
    });

    fsVideo.addEventListener("timeupdate", () => {
      syncHow();
      if (!fsTc) return;
      const t = Math.floor(fsVideo.currentTime);
      fsTc.textContent = `TC ${String(Math.floor(t / 60)).padStart(2, "0")}:${String(t % 60).padStart(2, "0")} · LOOP`;
    });
    syncHow();

    if (prefersReducedMotion) {
      playPill = document.createElement("button");
      playPill.className = "fs__play";
      playPill.type = "button";
      playPill.textContent = "▶ PLAY FOOTAGE";
      fsMain.appendChild(playPill);
      playPill.addEventListener("click", (e) => {
        e.stopPropagation();
        if (fsVideo.paused) {
          fsVideo.play().catch(() => {});
          playPill.textContent = "❚❚";
          playPill.classList.add("is-playing");
        } else {
          fsVideo.pause();
          playPill.textContent = "▶ PLAY FOOTAGE";
          playPill.classList.remove("is-playing");
        }
      });
    } else {
      // observe the stage, not the whole card: 35% of a tall card never
      // enters short viewports (landscape phones, small windows)
      const fsObserver = new IntersectionObserver((entries) => {
        entries.forEach((en) => {
          fsInView = en.isIntersecting;
          if (fsInView) fsVideo.play().catch(() => {});
          else fsVideo.pause();
        });
      }, { threshold: 0.35 });
      fsObserver.observe(fsMain);
    }
  };
  grid.querySelectorAll(".project--flagship").forEach((card) => initSpotlight(card, PROJECTS[card.dataset.index]));

  /* ==========================================================
     RENDER: TOOLS, dual marquee belt with real brand icons
     ========================================================== */
  const toolChip = (t) => {
    const mark = t.icon
      ? `<img src="assets/icons/${t.icon}.svg" alt="" loading="lazy" />`
      : t.short;
    return `<div class="tool" style="--tool:${t.color}"><span class="tool__mark">${mark}</span>${t.name}</div>`;
  };
  const half = Math.ceil(TOOLS.length / 2);
  const rowA = TOOLS.slice(0, half).map(toolChip).join("");
  const rowB = TOOLS.slice(half).map(toolChip).join("");
  // each track holds the set twice for a seamless -50% loop
  document.getElementById("toolsTrackA").innerHTML = rowA + rowA;
  document.getElementById("toolsTrackB").innerHTML = rowB + rowB;

  /* ==========================================================
     PRELOADER
     ========================================================== */
  const preloader = document.getElementById("preloader");
  const bar = document.getElementById("preloaderBar");
  const count = document.getElementById("preloaderCount");

  const finishLoad = () => {
    preloader.classList.add("is-done");
    document.body.classList.add("is-loaded");
    setTimeout(() => preloader.classList.add("is-hidden"), 1100);
    startCounters();
  };

  if (prefersReducedMotion) {
    preloader.classList.add("is-hidden");
    document.body.classList.add("is-loaded");
    startCounters();
  } else {
    let progress = 0;
    const tick = () => {
      progress = Math.min(100, progress + Math.random() * 16 + 6);
      bar.style.width = progress + "%";
      count.textContent = Math.round(progress);
      if (progress < 100) {
        setTimeout(tick, 110 + Math.random() * 130);
      } else {
        setTimeout(finishLoad, 350);
      }
    };
    tick();
  }

  /* ==========================================================
     COUNT-UP HELPERS
     ========================================================== */
  function countUp(el, target, duration = 1400) {
    const start = performance.now();
    const step = (now) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      el.textContent = Math.round(eased * target);
      if (t < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }

  function startCounters() {
    document.querySelectorAll("[data-count]").forEach((el) =>
      countUp(el, parseInt(el.dataset.count, 10))
    );
  }

  // Mini-dashboard KPI counts up when it scrolls into view
  const loopCounters = document.querySelectorAll("[data-count-loop]");
  if (loopCounters.length) {
    const kpiObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        countUp(entry.target, parseInt(entry.target.dataset.countLoop, 10), 1800);
        kpiObserver.unobserve(entry.target);
      });
    }, { threshold: 0.4 });
    loopCounters.forEach((el) => kpiObserver.observe(el));
  }

  /* ==========================================================
     MAGNETIC ELEMENTS
     ========================================================== */
  if (isFinePointer && !prefersReducedMotion) {
    document.querySelectorAll("[data-magnetic]").forEach((el) => {
      const strength = 0.35;
      el.addEventListener("mousemove", (e) => {
        const r = el.getBoundingClientRect();
        const x = e.clientX - (r.left + r.width / 2);
        const y = e.clientY - (r.top + r.height / 2);
        el.style.transform = `translate(${x * strength}px, ${y * strength}px)`;
      });
      el.addEventListener("mouseleave", () => {
        el.style.transition = "transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)";
        el.style.transform = "";
        setTimeout(() => (el.style.transition = ""), 500);
      });
    });
  }

  /* ==========================================================
     HEADER: scroll state, hide/show, progress
     ========================================================== */
  const header = document.getElementById("header");
  const progressBar = document.getElementById("scrollProgress");
  let lastY = 0;

  addEventListener("scroll", () => {
    const y = scrollY;
    header.classList.toggle("is-scrolled", y > 40);
    header.classList.toggle("is-hidden", y > 500 && y > lastY);
    lastY = y;
    const max = document.documentElement.scrollHeight - innerHeight;
    progressBar.style.width = (max > 0 ? (y / max) * 100 : 0) + "%";
  }, { passive: true });

  /* ==========================================================
     MOBILE MENU
     ========================================================== */
  const burger = document.getElementById("navBurger");
  const mobileMenu = document.getElementById("mobileMenu");
  const setMenu = (open) => {
    burger.classList.toggle("is-open", open);
    mobileMenu.classList.toggle("is-open", open);
    burger.setAttribute("aria-expanded", open);
    mobileMenu.setAttribute("aria-hidden", !open);
    document.body.style.overflow = open ? "hidden" : "";
  };
  burger.addEventListener("click", () => setMenu(!mobileMenu.classList.contains("is-open")));
  mobileMenu.querySelectorAll("a").forEach((a) => a.addEventListener("click", () => setMenu(false)));

  /* ==========================================================
     ACTIVE NAV LINK
     ========================================================== */
  const sections = ["work", "proof", "build", "system", "tools", "contact"];
  const navLinks = document.querySelectorAll(".nav__link");
  const bottomLinks = document.querySelectorAll(".bottomnav [data-bn]");
  const sectionObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      navLinks.forEach((l) => l.classList.toggle("is-active", l.getAttribute("href") === `#${entry.target.id}`));
      bottomLinks.forEach((l) => l.classList.toggle("is-active", l.dataset.bn === entry.target.id));
    });
  }, { rootMargin: "-40% 0px -55% 0px" });
  sections.forEach((id) => {
    const el = document.getElementById(id);
    if (el) sectionObserver.observe(el);
  });

  /* ==========================================================
     SCROLL REVEAL
     ========================================================== */
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("in-view");
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });

  document.querySelectorAll("[data-reveal]").forEach((el) => revealObserver.observe(el));

  // Proof cards: terminal lines type themselves on scroll
  const typeEls = document.querySelectorAll(".proof-card__type");
  if (typeEls.length) {
    const typeObs = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        if (!en.isIntersecting) return;
        typeObs.unobserve(en.target);
        const text = en.target.dataset.type;
        if (prefersReducedMotion) { en.target.textContent = text; return; }
        let i = 0;
        const tick = () => {
          en.target.textContent = text.slice(0, ++i);
          if (i < text.length) setTimeout(tick, 30);
        };
        setTimeout(tick, 500);
      });
    }, { threshold: 0.5 });
    typeEls.forEach((el) => typeObs.observe(el));
  }

  // System flow rail
  const flow = document.getElementById("systemFlow");
  if (flow) {
    const flowObserver = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) { flow.classList.add("in-view"); flowObserver.disconnect(); }
      });
    }, { threshold: 0.3 });
    flowObserver.observe(flow);
  }

  /* ==========================================================
     ROLE ROTATOR
     ========================================================== */
  const roles = [
    "Full Stack Developer",
    "AI Automation Engineer",
  ];
  const roleEl = document.getElementById("roleSwap");
  let roleIdx = 0;
  if (!prefersReducedMotion) {
    setInterval(() => {
      roleEl.classList.add("is-out");
      setTimeout(() => {
        roleIdx = (roleIdx + 1) % roles.length;
        roleEl.textContent = roles[roleIdx];
        roleEl.classList.remove("is-out");
        roleEl.classList.add("is-in");
        setTimeout(() => roleEl.classList.remove("is-in"), 520);
      }, 380);
    }, 2600);
  }

  /* ==========================================================
     HERO BUILD LINE
     What I actually do: an idea or a mess goes in, a running
     system comes out. Four real scenarios, not fake telemetry.
     ========================================================== */
  const blIn = document.getElementById("blIn");
  if (blIn) {
    const BUILDS = [
      {
        in: "Leads pile up in my inbox and go cold.",
        out: "Every lead captured, qualified, and booked while you run the business.",
        kind: "Lead capture system",
      },
      {
        in: "My site looks fine but nobody ever finds it.",
        out: "Fast, findable, and built so visits turn into booked calls.",
        kind: "Website build",
      },
      {
        in: "Quotes and follow-ups eat my whole week.",
        out: "Quotes go out in seconds, follow-ups run themselves, you stay in control.",
        kind: "Workflow automation",
      },
      {
        in: "I have an idea but no way to build it.",
        out: "A working product, shipped and live, with real users on it.",
        kind: "Digital product",
      },
    ];
    const blOut = document.getElementById("blOut");
    const blKind = document.getElementById("blKind");
    const blDots = document.getElementById("blDots");
    const stages = [...document.querySelectorAll(".buildline__stage")];
    const wires = [...document.querySelectorAll(".buildline__wire")];
    let blIdx = 0;
    let blTimers = [];

    blDots.innerHTML = BUILDS.map(() => "<b></b>").join("");
    const dots = [...blDots.children];

    const swap = (el, text) => {
      el.textContent = text;
      el.classList.remove("is-swap");
      void el.offsetWidth;
      el.classList.add("is-swap");
    };

    const runBuild = (i) => {
      const b = BUILDS[i];
      blTimers.forEach(clearTimeout);
      blTimers = [];
      stages.forEach((s) => s.classList.remove("is-on"));
      wires.forEach((w) => w.classList.remove("is-on"));
      dots.forEach((d, n) => d.classList.toggle("is-on", n === i));
      swap(blIn, b.in);
      blKind.textContent = b.kind;
      blOut.textContent = "";

      if (prefersReducedMotion) {
        stages.forEach((s) => s.classList.add("is-on"));
        wires.forEach((w) => w.classList.add("is-on"));
        blOut.textContent = b.out;
        return;
      }
      // design, build, automate light in order, then the outcome lands
      const at = (ms, fn) => blTimers.push(setTimeout(fn, ms));
      at(500, () => stages[0].classList.add("is-on"));
      at(1000, () => wires[0].classList.add("is-on"));
      at(1550, () => stages[1].classList.add("is-on"));
      at(2050, () => wires[1].classList.add("is-on"));
      at(2600, () => stages[2].classList.add("is-on"));
      at(3150, () => swap(blOut, b.out));
    };

    runBuild(0);
    if (!prefersReducedMotion) {
      setInterval(() => {
        blIdx = (blIdx + 1) % BUILDS.length;
        runBuild(blIdx);
      }, 6400);
    }
  }

  /* ==========================================================
     HERO PARALLAX (orbs + feed panel)
     ========================================================== */
  if (isFinePointer && !prefersReducedMotion) {
    const parallaxEls = document.querySelectorAll("[data-parallax]");
    let pmx = 0, pmy = 0, cx = 0, cy = 0;
    addEventListener("mousemove", (e) => {
      pmx = (e.clientX / innerWidth - 0.5) * 2;
      pmy = (e.clientY / innerHeight - 0.5) * 2;
    }, { passive: true });
    const parallaxLoop = () => {
      cx += (pmx - cx) * 0.05;
      cy += (pmy - cy) * 0.05;
      parallaxEls.forEach((el) => {
        const depth = parseFloat(el.dataset.parallax);
        el.style.translate = `${cx * depth}px ${cy * depth}px`;
      });
      requestAnimationFrame(parallaxLoop);
    };
    parallaxLoop();
  }

  /* ==========================================================
     3D TILT on project cards
     ========================================================== */
  if (isFinePointer && !prefersReducedMotion) {
    grid.querySelectorAll(".project").forEach((card) => {
      // full-width flagship gets a dampened tilt. 7 degrees on that span reads as broken
      const k = card.classList.contains("project--flagship") ? 2 : 7;
      card.addEventListener("mousemove", (e) => {
        const r = card.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width - 0.5;
        const py = (e.clientY - r.top) / r.height - 0.5;
        card.style.transform = `perspective(900px) rotateY(${px * k}deg) rotateX(${-py * k}deg) translateY(-4px)`;
      });
      card.addEventListener("mouseleave", () => { card.style.transform = ""; });
    });
  }

  /* ==========================================================
     SPOTLIGHT on build cards
     ========================================================== */
  document.querySelectorAll(".build-card, .project, .hstat").forEach((card) => {
    // flagship: the spot lives inside the feed stage, so track coords relative to it
    const fsMain = card.querySelector(".fs__main");
    card.addEventListener("mousemove", (e) => {
      const r = card.getBoundingClientRect();
      card.style.setProperty("--mx", `${e.clientX - r.left}px`);
      card.style.setProperty("--my", `${e.clientY - r.top}px`);
      if (fsMain) {
        const fr = fsMain.getBoundingClientRect();
        fsMain.style.setProperty("--mx", `${e.clientX - fr.left}px`);
        fsMain.style.setProperty("--my", `${e.clientY - fr.top}px`);
      }
    });
  });

  /* ==========================================================
     WORK: filters + desktop cap + show-all + mobile carousel
     ========================================================== */
  const filters = document.querySelectorAll(".filter");
  const workToggle = document.getElementById("workToggle");
  const workMore = workToggle.parentElement;
  let activeFilter = "All";
  let expanded = false;

  // Fill filter counts from the data
  filters.forEach((btn) => {
    const cat = btn.dataset.filter;
    const n = cat === "All" ? PROJECTS.length : PROJECTS.filter((p) => p.category === cat).length;
    btn.querySelector("sup").textContent = n;
  });

  function applyWork(animate) {
    let shown = 0;
    let matches = 0;
    grid.querySelectorAll(".project").forEach((card) => {
      const match = activeFilter === "All" || card.dataset.category === activeFilter;
      if (match) matches++;
      card.classList.toggle("is-filtered", !match);
      const collapsed = match && !expanded && shown >= DESKTOP_CAP;
      card.classList.toggle("is-collapsed", collapsed);
      card.classList.remove("is-entering");
      if (match && !collapsed) {
        if (animate) {
          void card.offsetWidth;
          card.style.animationDelay = `${shown * 0.06}s`;
          card.classList.add("is-entering");
        }
        shown++;
      }
    });
    workMore.classList.toggle("is-hidden", matches <= DESKTOP_CAP);
    workToggle.querySelector(".btn__text").textContent = expanded
      ? "Show less"
      : `Show all ${matches} projects`;
    workToggle.querySelector(".btn__arrow").textContent = expanded ? "↑" : "↓";
    const readout = document.getElementById("workReadout");
    if (readout) readout.textContent = `INDEX // ${String(matches).padStart(2, "0")} BUILDS ON RECORD`;
  }
  applyWork(false);

  filters.forEach((btn) => {
    btn.addEventListener("click", () => {
      filters.forEach((f) => f.classList.remove("is-active"));
      btn.classList.add("is-active");
      activeFilter = btn.dataset.filter;
      expanded = false;
      applyWork(true);
      grid.scrollTo({ left: 0, behavior: "smooth" });
    });
  });

  workToggle.addEventListener("click", () => {
    expanded = !expanded;
    applyWork(true);
    if (!expanded) document.getElementById("work").scrollIntoView({ behavior: "smooth" });
  });

  // Mobile carousel arrows
  const workPrev = document.getElementById("workPrev");
  const workNext = document.getElementById("workNext");
  const cardStep = () => {
    const card = grid.querySelector(".project:not(.is-filtered)");
    return card ? card.getBoundingClientRect().width + 16 : 300;
  };
  workPrev.addEventListener("click", () => grid.scrollBy({ left: -cardStep(), behavior: "smooth" }));
  workNext.addEventListener("click", () => grid.scrollBy({ left: cardStep(), behavior: "smooth" }));
  const updateArrows = () => {
    const maxScroll = grid.scrollWidth - grid.clientWidth;
    workPrev.disabled = grid.scrollLeft <= 4;
    workNext.disabled = grid.scrollLeft >= maxScroll - 4;
  };
  grid.addEventListener("scroll", updateArrows, { passive: true });
  addEventListener("resize", updateArrows, { passive: true });
  updateArrows();

  /* ==========================================================
     PROJECT MODAL
     ========================================================== */
  const modal = document.getElementById("modal");
  const modalImg = document.getElementById("modalImg");
  const modalName = document.getElementById("modalName");
  const modalType = document.getElementById("modalType");
  const modalDesc = document.getElementById("modalDesc");
  const modalTags = document.getElementById("modalTags");
  const modalCategory = document.getElementById("modalCategory");
  const modalCounter = document.getElementById("modalCounter");
  let currentIdx = 0;

  function renderModal(i) {
    const p = PROJECTS[i];
    currentIdx = i;
    document.getElementById("modalPanel").style.setProperty("--accent", p.accent);
    modalImg.src = p.image;
    modalImg.alt = `${p.name}, ${p.type}`;
    modalName.textContent = p.name;
    modalType.textContent = p.type;
    modalDesc.textContent = p.desc;
    document.getElementById("modalFor").textContent = p.audience;
    document.getElementById("modalProves").textContent = p.proves;
    modalCategory.textContent = p.category;
    modalCounter.textContent = `${String(i + 1).padStart(2, "0")} / ${String(PROJECTS.length).padStart(2, "0")}`;
    modalTags.innerHTML = p.tags.map((t) => `<span>${t}</span>`).join("");
  }

  function openModal(i) {
    renderModal(i);
    modal.classList.add("is-open");
    modal.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
  }

  function closeModal() {
    modal.classList.remove("is-open");
    modal.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
  }

  const stepModal = (dir) => {
    const panel = document.getElementById("modalPanel");
    panel.style.opacity = "0";
    panel.style.transform = `translateX(${dir * 40}px)`;
    setTimeout(() => {
      renderModal((currentIdx + dir + PROJECTS.length) % PROJECTS.length);
      panel.style.transition = "none";
      panel.style.transform = `translateX(${-dir * 40}px)`;
      void panel.offsetWidth;
      panel.style.transition = "";
      panel.style.opacity = "";
      panel.style.transform = "";
    }, 220);
  };

  document.getElementById("modalClose").addEventListener("click", closeModal);
  document.getElementById("modalBackdrop").addEventListener("click", closeModal);
  document.getElementById("modalPrev").addEventListener("click", () => stepModal(-1));
  document.getElementById("modalNext").addEventListener("click", () => stepModal(1));

  // project modal → wizard, preloaded with the matching service
  const CATEGORY_SERVICE = {
    "Websites": "Website",
    "AI Systems": "AI Automation",
    "Digital Products": "Digital Product",
    "Growth Work": "Website",
  };
  document.getElementById("modalCta").addEventListener("click", () => {
    const p = PROJECTS[currentIdx];
    closeModal();
    openWizard(CATEGORY_SERVICE[p.category]);
  });

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
  };

  const WIZARD_STEPS = [
    {
      key: "service",
      q: "What are we building?",
      hint: "Pick the closest fit. We refine it together later.",
      options: [
        { v: "Website", d: "Landing page or full site that converts", icon: "globe" },
        { v: "AI Automation", d: "Workflows that run your busywork 24/7", icon: "zap" },
        { v: "Business System", d: "CRM, dashboards, pipelines, reporting", icon: "chart" },
        { v: "Digital Product", d: "Web or mobile app, MVP to launch", icon: "blocks" },
      ],
    },
    {
      key: "goal",
      q: "What's the main goal?",
      hint: "The outcome that would make this a win.",
      options: [
        { v: "More leads & sales", d: "Turn traffic into pipeline", icon: "trend" },
        { v: "Save time with automation", d: "Kill the manual busywork", icon: "clock" },
        { v: "Launch something new", d: "From idea to shipped", icon: "star" },
        { v: "Level up the brand", d: "Look as premium as the work", icon: "target" },
      ],
    },
    {
      key: "budget",
      q: "Ballpark budget?",
      hint: "USD. A range is enough to scope the right solution.",
      options: [
        { v: "Under $1,000", d: "Lean and focused", icon: "coin" },
        { v: "$1,000 – $3,000", d: "Solid single build", icon: "coin" },
        { v: "$3,000 – $10,000", d: "Full system", icon: "coin" },
        { v: "$10,000+", d: "End-to-end partner", icon: "coin" },
      ],
    },
    {
      key: "timeline",
      q: "When do you need it?",
      hint: "Honest timelines make better builds.",
      options: [
        { v: "ASAP, this month", d: "Fast-track it", icon: "zap" },
        { v: "2–4 weeks", d: "Standard sprint", icon: "clock" },
        { v: "1–3 months", d: "Room to go deep", icon: "clock" },
        { v: "Flexible / exploring", d: "Just scoping for now", icon: "target" },
      ],
    },
    { key: "details", q: "Tell me about you.", hint: "So I know who to reply to.", form: true },
    { key: "review", q: "Your project brief.", hint: "Sending opens your email app with everything pre-filled.", review: true },
  ];

  const wizard = document.getElementById("wizard");
  const wizardStep = document.getElementById("wizardStep");
  const wizardBar = document.getElementById("wizardBar");
  const wizardStepNum = document.getElementById("wizardStepNum");
  const wizardBack = document.getElementById("wizardBack");
  const wizardNext = document.getElementById("wizardNext");
  const wizardDots = document.getElementById("wizardDots");
  const answers = {};
  let stepIdx = 0;
  let sent = false;

  WIZARD_STEPS.forEach(() => {
    const dot = document.createElement("i");
    wizardDots.appendChild(dot);
  });

  function renderStep(dir) {
    const step = WIZARD_STEPS[stepIdx];
    let html = `<h3 class="wizard__q">${step.q}</h3><p class="wizard__hint">${step.hint}</p>`;

    if (step.options) {
      html += `<div class="wizard__options">${step.options
        .map(
          (o) => `
        <button type="button" class="wizard-option ${answers[step.key] === o.v ? "is-selected" : ""}" data-value="${o.v}">
          <span class="wizard-option__icon">${ICONS[o.icon]}</span>
          <span><strong>${o.v}</strong><small>${o.d}</small></span>
          <span class="wizard-option__check">✓</span>
        </button>`
        )
        .join("")}</div>`;
    } else if (step.form) {
      html += `<div class="wizard__fields">
        <div class="wizard-field"><label>Name <em>*</em></label><input type="text" id="wzName" placeholder="Your name" value="${answers.name || ""}" /></div>
        <div class="wizard-field"><label>Email <em>*</em></label><input type="email" id="wzEmail" placeholder="you@company.com" value="${answers.email || ""}" /></div>
        <div class="wizard-field"><label>Company / brand</label><input type="text" id="wzCompany" placeholder="Optional" value="${answers.company || ""}" /></div>
        <div class="wizard-field"><label>Anything else?</label><textarea id="wzNotes" placeholder="Links, context, the problem in your own words…">${answers.notes || ""}</textarea></div>
      </div>`;
    } else if (step.review) {
      if (sent) {
        html = `<div class="wizard__sent">
          <div class="wizard__sent-icon">✓</div>
          <h4>Brief on its way.</h4>
          <p>Your email app should be open with everything pre-filled, so just hit send. If it didn't open, use the copy button below and email it to <b>hello@chester.studio</b>.</p>
        </div>`;
      } else {
        const rows = [
          ["Building", answers.service],
          ["Goal", answers.goal],
          ["Budget", answers.budget],
          ["Timeline", answers.timeline],
          ["Name", answers.name],
          ["Email", answers.email],
        ]
          .filter((r) => r[1])
          .map((r) => `<div class="wizard__summary-row"><span>${r[0]}</span><b>${r[1]}</b></div>`)
          .join("");
        html += `<div class="wizard__summary">${rows}</div>`;
      }
    }

    wizardStep.classList.remove("is-enter-left", "is-enter-right", "is-exit-left", "is-exit-right");
    wizardStep.innerHTML = html;
    if (dir) wizardStep.classList.add(dir > 0 ? "is-enter-right" : "is-enter-left");

    // wire options: select + auto-advance
    wizardStep.querySelectorAll(".wizard-option").forEach((btn) => {
      btn.addEventListener("click", () => {
        wizardStep.querySelectorAll(".wizard-option").forEach((b) => b.classList.remove("is-selected"));
        btn.classList.add("is-selected");
        answers[WIZARD_STEPS[stepIdx].key] = btn.dataset.value;
        syncFooter();
        setTimeout(() => goTo(stepIdx + 1), 420);
      });
    });

    syncFooter();
    const firstInput = wizardStep.querySelector("input");
    if (firstInput) setTimeout(() => firstInput.focus(), 350);
  }

  function stepValid() {
    const step = WIZARD_STEPS[stepIdx];
    if (step.options) return !!answers[step.key];
    if (step.form) {
      const name = document.getElementById("wzName");
      const email = document.getElementById("wzEmail");
      return name && name.value.trim() && email && /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email.value.trim());
    }
    return true;
  }

  function collectForm() {
    const step = WIZARD_STEPS[stepIdx];
    if (!step.form) return;
    answers.name = document.getElementById("wzName").value.trim();
    answers.email = document.getElementById("wzEmail").value.trim();
    answers.company = document.getElementById("wzCompany").value.trim();
    answers.notes = document.getElementById("wzNotes").value.trim();
  }

  function syncFooter() {
    const step = WIZARD_STEPS[stepIdx];
    const pct = (stepIdx / (WIZARD_STEPS.length - 1)) * 100;
    wizardBar.style.width = `${Math.max(8, pct)}%`;
    wizardStepNum.textContent = `${String(stepIdx + 1).padStart(2, "0")} / ${String(WIZARD_STEPS.length).padStart(2, "0")}`;
    wizardBack.classList.toggle("is-hidden", stepIdx === 0 || sent);
    [...wizardDots.children].forEach((d, i) => {
      d.classList.toggle("is-active", i === stepIdx);
      d.classList.toggle("is-done", i < stepIdx);
    });
    const nextText = wizardNext.querySelector(".btn__text");
    const nextArrow = wizardNext.querySelector(".btn__arrow");
    if (sent) {
      nextText.textContent = "Copy brief";
      nextArrow.textContent = "⧉";
      wizardNext.disabled = false;
    } else if (step.review) {
      nextText.textContent = "Send brief";
      nextArrow.textContent = "→";
      wizardNext.disabled = false;
    } else {
      nextText.textContent = "Continue";
      nextArrow.textContent = "→";
      wizardNext.disabled = step.options ? !answers[step.key] : false;
    }
  }

  function goTo(idx, dirOverride) {
    if (idx < 0 || idx >= WIZARD_STEPS.length) return;
    const dir = dirOverride !== undefined ? dirOverride : idx > stepIdx ? 1 : -1;
    wizardStep.classList.add(dir > 0 ? "is-exit-left" : "is-exit-right");
    setTimeout(() => {
      stepIdx = idx;
      renderStep(dir);
    }, 230);
  }

  function briefText() {
    return [
      `New project inquiry for Chester Studio`,
      ``,
      `Building:  ${answers.service || "not specified"}`,
      `Goal:      ${answers.goal || "not specified"}`,
      `Budget:    ${answers.budget || "not specified"}`,
      `Timeline:  ${answers.timeline || "not specified"}`,
      ``,
      `Name:      ${answers.name || "not specified"}`,
      `Email:     ${answers.email || "not specified"}`,
      `Company:   ${answers.company || "not specified"}`,
      ``,
      `Notes:`,
      answers.notes || "not specified",
    ].join("\n");
  }

  function submitWizard() {
    const subject = `Project inquiry: ${answers.service || "New build"} · ${answers.name || ""}`;
    const href = `mailto:hello@chester.studio?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(briefText())}`;
    sent = true;
    renderStep(1);
    window.location.href = href;
  }

  function openWizard(preService) {
    sent = false;
    if (preService) {
      answers.service = preService;
      stepIdx = 1;
    } else {
      stepIdx = 0;
    }
    renderStep(0);
    wizard.classList.add("is-open");
    wizard.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
  }

  function closeWizard() {
    wizard.classList.remove("is-open");
    wizard.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
  }

  document.querySelectorAll("[data-wizard-open]").forEach((btn) => {
    btn.addEventListener("click", () => openWizard(btn.dataset.wizardService));
  });
  document.getElementById("wizardClose").addEventListener("click", closeWizard);
  document.getElementById("wizardBackdrop").addEventListener("click", closeWizard);
  wizardBack.addEventListener("click", () => goTo(stepIdx - 1));

  wizardNext.addEventListener("click", () => {
    const step = WIZARD_STEPS[stepIdx];
    if (sent) {
      navigator.clipboard && navigator.clipboard.writeText(briefText());
      wizardNext.querySelector(".btn__text").textContent = "Copied ✓";
      return;
    }
    if (step.form) {
      if (!stepValid()) {
        const email = document.getElementById("wzEmail");
        const name = document.getElementById("wzName");
        if (name && !name.value.trim()) name.classList.add("is-invalid");
        if (email && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email.value.trim())) email.classList.add("is-invalid");
        wizardStep.querySelectorAll("input").forEach((inp) =>
          inp.addEventListener("input", () => inp.classList.remove("is-invalid"), { once: true })
        );
        return;
      }
      collectForm();
      goTo(stepIdx + 1);
      return;
    }
    if (step.review) {
      submitWizard();
      return;
    }
    if (stepValid()) goTo(stepIdx + 1);
  });

  /* ==========================================================
     GLOBAL KEYBOARD
     ========================================================== */
  addEventListener("keydown", (e) => {
    if (wizard.classList.contains("is-open")) {
      if (e.key === "Escape") closeWizard();
      if (e.key === "Enter" && !e.shiftKey && e.target.tagName !== "TEXTAREA") {
        e.preventDefault();
        if (!wizardNext.disabled) wizardNext.click();
      }
      return;
    }
    if (!modal.classList.contains("is-open")) return;
    if (e.key === "Escape") closeModal();
    if (e.key === "ArrowRight") stepModal(1);
    if (e.key === "ArrowLeft") stepModal(-1);
  });

  /* ==========================================================
     MISC
     ========================================================== */
  document.getElementById("year").textContent = new Date().getFullYear();
  document.getElementById("toTop").addEventListener("click", () =>
    scrollTo({ top: 0, behavior: prefersReducedMotion ? "auto" : "smooth" })
  );
})();
