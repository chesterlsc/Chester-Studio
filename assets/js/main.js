/* ============================================================
   CHESTER STUDIO :: interactions
   Vanilla JS. No dependencies, no build step.
   ============================================================ */

(() => {
  "use strict";

  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const isFinePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  // the intake and the command palette live in site.js, shared with every page
  const openWizard = (...a) => window.CS.openWizard(...a);

  /* ==========================================================
     PROJECT DATA
     ========================================================== */
  const PROJECTS = [
    {
      name: "Ulap Coffee Roasters",
      type: "WooCommerce Store + Custom Plugins",
      category: "Websites",
      image: "public/projects/ulap-coffee.webp",
      audience: "Shops that sell on WordPress",
      proves: "Hand-built WordPress: a block theme, two plugins and GCash checkout",
      desc: "A complete WooCommerce store for a Philippine coffee roaster. A custom block theme, a GCash, Maya and bank transfer plugin with receipt upload and one-click verify, and a brew calculator on the Interactivity API.",
      tags: ["WordPress", "WooCommerce", "PHP", "Plugins"],
      page: "wordpress/",
      service: "WordPress / WooCommerce",
    },
    {
      name: "Motorcycle Dealership",
      type: "Dealership Sales Website",
      category: "Websites",
      image: "public/projects/build-dealership.webp",
      audience: "Local dealerships and resellers",
      proves: "Trust-first design sells high-ticket inventory",
      desc: "A trust-first site for a motorcycle dealership. Live inventory, sold-unit proof, walkaround reels, and a Messenger-first buying flow with nationwide delivery.",
      tags: ["Branding", "Inventory", "Mobile", "Conversion"],
    },
    {
      name: "Creative Studio",
      type: "Creative Studio Brand Site",
      category: "Websites",
      image: "public/projects/build-studio.jpg",
      audience: "Studios and personal brands",
      proves: "Design taste that makes a brand feel premium",
      desc: "A creative studio site with personality. Motion, typography, and a portfolio grid that lets the work speak for itself.",
      tags: ["Creative", "Motion", "Portfolio"],
    },
    {
      name: "Real Estate Automation",
      type: "Lead-to-Booking Automation",
      category: "AI Systems",
      image: "public/projects/build-realestate.jpg",
      audience: "Real estate agents and teams",
      proves: "Leads captured, qualified, and booked with no manual chase",
      desc: "A mobile-first automation system for real estate agents. Every lead captured, qualified by AI, followed up instantly, and booked on autopilot, with a live pipeline dashboard.",
      tags: ["AI", "Automation", "Real Estate", "Mobile"],
    },
    {
      name: "Home-Service Quoting AI",
      type: "Quote Follow-up Automation",
      category: "AI Systems",
      image: "public/projects/build-quoting.jpg",
      audience: "HVAC, plumbing, and roofing teams",
      proves: "Instant follow-ups turn estimates into booked jobs",
      desc: "A SaaS platform for home service companies. Estimate requests become booked jobs through instant SMS and email follow-ups, smart scheduling, and a real-time growth dashboard.",
      tags: ["AI", "SaaS", "Follow-ups", "Dashboard"],
    },
    {
      name: "Talent & Creative Agency",
      type: "Agency Brand Site",
      category: "Growth Work",
      image: "public/projects/build-agency.jpg",
      audience: "Agencies and talent brands",
      proves: "Editorial positioning that commands premium rates",
      desc: "A black-and-gold creative agency site. Talent management, campaign production, and brand strategy told with editorial confidence and world-class social proof.",
      tags: ["Branding", "Agency", "Editorial", "Talent"],
    },
    {
      name: "Business Ecosystem Hub",
      type: "Business Ecosystem Hub",
      category: "Growth Work",
      image: "public/projects/build-ecosystem.jpg",
      audience: "Multi-brand operators",
      proves: "Complex ecosystems made clear enough to sell",
      desc: "The operating layer of modern business. An ecosystem site mapping how a systems firm, a creative studio, an education arm and acquisitions feed one system, with a live input-to-output diagram.",
      tags: ["Ecosystem", "Positioning", "Systems"],
    },
    {
      name: "Revenue Systems Firm",
      type: "Revenue Systems Site",
      category: "Growth Work",
      image: "public/projects/build-revenue.webp",
      audience: "Service businesses with messy operations",
      proves: "Positioning plus a diagnostic that turns visitors into intake",
      desc: "A revenue systems firm’s site. Sharp positioning, a revenue-leak diagnostic, and a live workflow demo that shows service businesses exactly what gets fixed.",
      tags: ["Positioning", "Systems", "Conversion"],
    },
    {
      name: "Personal AI Assistant",
      type: "Personal AI Assistant",
      category: "AI Systems",
      image: "public/projects/build-assistant.webp",
      audience: "Anyone who wants AI beyond a chatbot",
      proves: "Voice, vision, and local control built from scratch",
      desc: "A personal AI assistant with a cinematic HUD. Wake-word voice control, live system stats, weather, camera feed, and a conversational interface running locally.",
      tags: ["AI", "Voice", "Dashboard", "Python"],
    },
    {
      name: "AI Garage Diagnostics",
      type: "AI Diagnostics Tool",
      category: "AI Systems",
      image: "public/projects/build-diagnostics.webp",
      audience: "Auto shops and garages",
      proves: "AI applied to a messy real-world trade",
      desc: "AI-powered vehicle diagnostics that helps garages triage faster. Symptoms in, ranked causes and repair guidance out.",
      tags: ["AI", "Diagnostics", "Product"],
    },
    {
      name: "Live Blackjack Platform",
      type: "Live Gaming Platform",
      category: "Digital Products",
      image: "public/projects/build-blackjack.webp",
      audience: "Product founders who need real-time logic",
      proves: "Live state, money math, and polish under pressure",
      desc: "A full live blackjack platform. Solo and multi-seat tables, four side bets, drag-and-drop chips, free-bet mode, bet history, and real-time dealer logic under a polished brand.",
      tags: ["Game", "Real-time", "Product", "UI"],
    },
    {
      name: "Guided Intake Flow",
      type: "Guided Intake Experience",
      category: "Websites",
      image: "public/projects/build-intake.jpg",
      audience: "Anyone replacing a dead contact form",
      proves: "Forms convert when they feel like a conversation",
      desc: "An 8-step guided intake that replaces the contact form. One question at a time, editorial typography, and routing that sends every inquiry to the right place.",
      tags: ["UX", "Wizard", "Forms", "Conversion"],
    },
    {
      name: "Local Accounting Firm",
      type: "Professional Services Site",
      category: "Websites",
      image: "public/projects/build-accounting.webp",
      audience: "Accountants, lawyers, and consultants",
      proves: "Credibility design that wins serious clients",
      desc: "A trust-first website for an accounting firm. Services, credentials, and lead capture designed to convert serious clients.",
      tags: ["Corporate", "Lead Gen", "SEO"],
    },
    {
      name: "On-Demand Mechanic App",
      type: "On-demand Service Product",
      category: "Digital Products",
      image: "public/projects/build-mechanic.webp",
      audience: "Service marketplace founders",
      proves: "Booking, tracking, and payments in one flow",
      desc: "An on-demand home service platform connecting customers with vetted repair pros. Booking, tracking, and payments end to end, with a landing page built to convert.",
      tags: ["Mobile", "Marketplace", "UX"],
    },
    {
      name: "Indoor Mall Navigation",
      type: "Indoor Navigation Product",
      category: "Digital Products",
      image: "public/projects/build-mallnav.webp",
      audience: "Malls and large venues",
      proves: "Complex wayfinding made simple on mobile",
      desc: "Indoor navigation for malls. Searchable directories, turn-by-turn wayfinding, and store promos in a clean mobile experience, backed by a marketing site that drives installs.",
      tags: ["Mobile", "Maps", "Product"],
    },
    {
      name: "Pet Matching App",
      type: "Community Matching Product",
      category: "Digital Products",
      image: "public/projects/build-petmatch.webp",
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
    { name: "WordPress", icon: "wordpress", color: "#3c96d0" },
    { name: "WooCommerce", icon: "woocommerce", color: "#9d74d0" },
    { name: "PHP", icon: "php", color: "#8892BF" },
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
    "Ulap Coffee Roasters": "#e08a5b",
    "Motorcycle Dealership": "#ff4d4d",
    "Trader Journal": "#ff6a2b",
    "Miniature Bookshop": "#ffab98",
    "Creative Studio": "#a78bfa",
    "Real Estate Automation": "#4aa8ff",
    "Home-Service Quoting AI": "#ff8a3d",
    "Talent & Creative Agency": "#d4a24c",
    "Business Ecosystem Hub": "#d8b45a",
    "Revenue Systems Firm": "#2f7dff",
    "Personal AI Assistant": "#3fd8f0",
    "AI Garage Diagnostics": "#4ade80",
    "Live Blackjack Platform": "#52e0a4",
    "Guided Intake Flow": "#d8b45a",
    "Local Accounting Firm": "#34d399",
    "On-Demand Mechanic App": "#22c55e",
    "Indoor Mall Navigation": "#38bdf8",
    "Pet Matching App": "#fb923c",
  };
  PROJECTS.forEach((p) => {
    p.accent = ACCENTS[p.name] || "#178bff";
    p.slug = p.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  });

  /* ==========================================================
     FLAGSHIPS :: the four products on the Selected Work wall.
     Each groups its features by who meets them: the customer,
     the owner, and what runs behind it. `v` drives the visual.
     ========================================================== */
  const P = "public/projects/";
  const TF_MARK = '<svg viewBox="0 0 23 23" aria-hidden="true"><path class="leaf leaf--l" d="M0 6H2.2A8.8 12.8 0 0 1 11 18.8V22H8.8A8.8 12.8 0 0 1 0 9.2Z"/><path class="leaf leaf--r" d="M12 14.8A8.8 12.8 0 0 1 20.8 2H23V5.2A8.8 12.8 0 0 1 14.2 18H12Z"/></svg>';
  const WORK = [
    {
      id: "tapfour", name: "Tapfour", kind: "NFC tap stands + business software", label: "LIVE · TAP4.PH",
      accent: "#c8f23c", railId: "TAP4//EDGE", service: "Business System", url: "https://tap4.ph",
      logo: { svg: TF_MARK },
      oneLine: "A tap on a Tapfour Connect stand opens a shop’s Google review page, its menu or its socials, with no app to install. Behind the stand runs the software I built for it: an owner dashboard for taps, menu, bills, stock, staff and branches, and an admin console that takes every stand from blank chip to live.",
      short: "One tap opens your review page, menu or socials. Behind it, an owner dashboard and an admin console I built end to end.",
      poster: P + "tapfour-dash-home.webp",
      cover: P + "tapfour.webp",
      feeds: [
        { label: "FEED 01", tag: "TAP.FILM", start: 4, poster: P + "tapfour.webp", webm: P + "tapfour-feed-01.webm", mp4: P + "tapfour-feed-01.mp4" },
        { label: "FEED 02", tag: "DASHBOARD.TAP4.PH", poster: P + "tapfour-dash-home.webp" },
        { label: "FEED 03", tag: "ADMIN.TAP4.PH", poster: P + "tapfour-admin-home.webp" },
      ],
      how: [
        { t: "Pick the stand", d: "Tapfour Connect in Glossy Black or White, or the 4-Tap Bar." },
        { t: "Choose where taps go", d: "Google review, the menu, socials, or all four on one page." },
        { t: "Customers tap", d: "Their phone opens the page at once. Nothing to install." },
        { t: "Run the shop", d: "Taps, busiest hours, bills, stock and staff on one dashboard." },
        { t: "Change it anytime", d: "Edit a link and the very next tap follows. No reprint." },
      ],
      proof: ["OWNER DASHBOARD + ADMIN CONSOLE", "EDITS LIVE ON THE NEXT TAP", "QR EXPORT · SVG + PNG", "BOT TAPS FLAGGED · DOUBLE TAPS MERGED"],
      stack: "Cloudflare Workers (Hono) · D1 at the edge · Shopify",
      heads: ["home", "board", "connect"],
      groups: [
        { label: "What customers see", feats: [
          { id: "connect", t: "Tapfour Connect", b: "Tap for a Google review, scan for the menu. One glossy stand.", v: { type: "photo", src: P + "tapfour-connect-black-menu.jpg" } },
          { id: "finish", t: "Glossy Black or White", b: "Review, Review + QR menu, or Socials 4-in-1 designs.", v: { type: "photo", src: P + "tapfour-connect-white-review.webp" } },
          { id: "bar", t: "4-Tap Bar", b: "Four tap zones, each straight to its own app.", v: { type: "photo", src: P + "tapfour-bar.jpg" } },
          { id: "links", t: "A 4-in-1 links page", b: "Review, menu and socials on one page in the shop’s colour.", v: { type: "shot", src: P + "tapfour-page-links.webp" } },
          { id: "menu", t: "A live QR menu", b: "Sold-out items show the moment the owner marks them.", v: { type: "shot", src: P + "tapfour-page-menu.webp" } },
        ] },
        { label: "The owner dashboard", feats: [
          { id: "home", t: "Today, at a glance", b: "Taps, QR scans, reviews opened and menu views, live.", v: { type: "shot", src: P + "tapfour-dash-home.webp" } },
          { id: "needs", t: "“Needs you” first", b: "Late bills and low stock sit beside the busiest hours.", v: { type: "shot", src: P + "tapfour-dash-home.webp" } },
          { id: "dest", t: "Change where taps go", b: "Edit a link and every stand follows on the next tap.", v: { type: "shot", src: P + "tapfour-dash-links.webp" } },
          { id: "menuedit", t: "Menu editor", b: "Change a price or mark it sold out. No reprint.", v: { type: "shot", src: P + "tapfour-dash-menu.webp" } },
          { id: "billing", t: "Bills to pay", b: "Late, this week, unpaid. Paid ✓ books next month’s.", v: { type: "shot", src: P + "tapfour-dash-billing.webp" } },
          { id: "stock", t: "Stock with low warnings", b: "Tap − and + as you use it. Low items reach Home.", v: { type: "shot", src: P + "tapfour-dash-stock.webp" } },
          { id: "staff", t: "Who’s working", b: "Shifts by branch; status updates itself from the clock.", v: { type: "shot", src: P + "tapfour-dash-staff.webp" } },
          { id: "branches", t: "Branches", b: "Taps per branch, up to 20 on the Empire plan.", v: { type: "shot", src: P + "tapfour-dash-branches.webp" } },
          { id: "report", t: "Monthly report", b: "What people opened and when. Print or save as PDF.", v: { type: "shot", src: P + "tapfour-dash-reports.webp" } },
        ] },
        { label: "The admin console", feats: [
          { id: "overview", t: "Every tap, every stand", b: "All clients’ taps, scans and setup work on one screen.", v: { type: "shot", src: P + "tapfour-admin-home.webp" } },
          { id: "clients", t: "Clients and plans", b: "Each business, its plan, its stands and its taps.", v: { type: "shot", src: P + "tapfour-admin-clients.webp" } },
          { id: "board", t: "Stand setup board", b: "Write the chip, tap to test, quality check, go live.", v: { type: "shot", src: P + "tapfour-admin-board.webp" } },
          { id: "device", t: "Device page + QR export", b: "Every stand’s links, with the QR as SVG or PNG.", v: { type: "shot", src: P + "tapfour-admin-device.webp" } },
          { id: "history", t: "Who changed what", b: "Every link change, check and login, with who did it.", v: { type: "shot", src: P + "tapfour-admin-history.webp" } },
          { id: "edge", t: "Redirects at the edge", b: "Bot taps flagged; a double read within 10 s counts once.", v: { type: "flow", steps: ["Tap", "Edge 302", "Your page"] } },
        ] },
      ],
    },
    {
      id: "aegis", name: "AegisLeadOS", kind: "AI lead generation console", label: "IN-HOUSE PRODUCT",
      accent: "#33d6e2", railId: "AEGIS//OPS", service: "AI Automation",
      logo: { img: "public/logos/aegis-logo.png" },
      oneLine: "Give it one order, like “capture 10 med spas in New York”, and it finds the businesses, walks each website the way a customer would, diagnoses the revenue leak and drafts the outreach. A human approves every send.",
      short: "One typed order finds, scores and drafts outreach to local businesses. You approve every send.",
      poster: P + "aegis-leados.webp",
      feeds: [
        { label: "FEED 01", tag: "CAPTURE.RUN", poster: P + "aegis-leados-capture.webp", webm: P + "aegis-feed-01.webm", mp4: P + "aegis-feed-01.mp4" },
        { label: "FEED 02", tag: "WORKFLOW.LIVE", poster: P + "aegis-leados-workflow.webp", webm: P + "aegis-feed-02.webm", mp4: P + "aegis-feed-02.mp4" },
        { label: "FEED 03", tag: "OPS.PIPELINE", poster: P + "aegis-leados-pipeline.webp", webm: P + "aegis-feed-03.webm", mp4: P + "aegis-feed-03.mp4" },
      ],
      how: [
        { t: "Pick a market", d: "HVAC, roofing, med spa, dental. Any local service, any US city." },
        { t: "AI sweeps the map", d: "Finds real businesses, then walks each website like a customer would." },
        { t: "Workflow qualifies", d: "Evidence, demand checks and a live revenue-leak diagnosis." },
        { t: "You approve", d: "Human verification gates every send. Nothing goes out on its own." },
        { t: "Start the outreach", d: "Scored, diagnosed and drafted in your pipeline. You send when ready." },
      ],
      proof: ["1,231 TESTS PASSING", "LEADS SCORED 0–6", "EVERY SEND HUMAN-GATED", "VOICE-COMMANDABLE"],
      stack: "Swift shell · local Node core · React · deck.gl",
      heads: ["capture", "score", "drafted"],
      groups: [
        { label: "What the operator sees", feats: [
          { id: "atlas", t: "Territorial atlas", b: "Watch the whole market light up on a live map.", v: { type: "shot", src: P + "aegis-leados-capture.webp" } },
          { id: "capture", t: "One order starts a run", b: "Type or say “10 med spas in New York” and it goes.", v: { type: "cmd", prompt: "▸", line: "capture 10 med spas in New York", out: ["SWEEPING", "12 FOUND", "10 TO QUALIFY"] } },
          { id: "score", t: "Lead scores 0–6, with receipts", b: "See why a lead is worth a call, not just a number.", v: { type: "score", n: 5, of: 6, ev: ["No online booking", "Form unanswered 9 days", "4.6★ · 167 reviews"] } },
          { id: "leak", t: "Revenue-leak diagnosis", b: "Know exactly where each business is losing customers.", v: { type: "rows", rows: [{ a: "Contact form never answered", b: "SEVERE", tone: "bad" }, { a: "No tap-to-call on mobile", b: "VISIBLE", tone: "warn" }, { a: "Booking hidden 3 clicks deep", b: "CLEAR", tone: "acc" }] } },
          { id: "crm", t: "CRM pipeline with replies", b: "Every lead and every reply on one board.", v: { type: "shot", src: P + "aegis-leados-pipeline.webp" } },
        ] },
        { label: "The safety net", feats: [
          { id: "drafted", t: "Drafted, never auto-sent", b: "Nothing reaches a prospect until you’ve read it.", v: { type: "gate", steps: ["Drafted", "You review", "Send"], lock: 2 } },
          { id: "approval", t: "A human approves every send", b: "Approve, edit or kill each message in one click.", v: { type: "rows", rows: [{ a: "Opener · first touch", b: "APPROVED", tone: "ok" }, { a: "Opener · second lead", b: "WAITING ON YOU", tone: "warn" }, { a: "Follow-up · day 3", b: "EDITED", tone: "acc" }] } },
        ] },
        { label: "Under the hood", feats: [
          { id: "mac", t: "A native Mac app", b: "Runs on your Mac; your lead data stays local.", v: { type: "flow", steps: ["Swift shell", "Node core", "React UI"] } },
          { id: "voice", t: "Voice-commandable console", b: "Ask out loud; it answers and acts.", v: { type: "cmd", prompt: "◉", line: "show me Memphis roofers", out: ["LISTENING", "24 ON THE MAP"] } },
          { id: "tests", t: "1,231 passing tests", b: "Built to be trusted with your pipeline.", v: { type: "term", lines: ["capture.run", "score.evidence", "gate.approve"], total: "1,231 passing" } },
          { id: "markets", t: "Any local service market", b: "HVAC, roofing, dental or med spa: same play.", v: { type: "chips", items: ["HVAC", "Roofing", "Dental", "Med spa", "Plumbing"], hi: 3 } },
        ] },
      ],
    },
    {
      id: "trader", name: "Trader Journal", kind: "Trading journal platform · v2.0", label: "IN-HOUSE PRODUCT",
      accent: "#ff6a2b", railId: "TJ//DESK", service: "Digital Product",
      logo: { img: "public/logos/trader-journal.svg" },
      oneLine: "The journal I keep my own trading in. Type one line, close the trade, grade it in one tap, and the whole desk updates. It never shows a number it made up.",
      short: "Log a trade in one line, grade it in one tap, and see your real edge.",
      poster: P + "trader-journal.webp",
      feeds: [
        { label: "FEED 01", tag: "LOG.TRADE", poster: P + "trader-journal-log.webp", webm: P + "trader-feed-01.webm?v=2", mp4: P + "trader-feed-01.mp4?v=2" },
        { label: "FEED 02", tag: "CALENDAR.DRILL", poster: P + "trader-journal-calendar.webp", webm: P + "trader-feed-02.webm?v=2", mp4: P + "trader-feed-02.mp4?v=2" },
        { label: "FEED 03", tag: "SESSION.INTEL", poster: P + "trader-journal-timing.webp", webm: P + "trader-feed-03.webm?v=2", mp4: P + "trader-feed-03.mp4?v=2" },
      ],
      how: [
        { t: "Log the trade", d: "One line: symbol, side, entry, stop, size. Risk and R:R show before Enter." },
        { t: "Close and grade it", d: "Close at the live price, then one tap for mood and one for grade." },
        { t: "The desk reacts", d: "Net P&L, today, the equity curve and the calendar update at once." },
        { t: "Drill any day", d: "Click a calendar day to land in its trades. A broker CSV imports into it." },
        { t: "Read the session report", d: "Entry hours and hold times ranked, labelled developing or reliable." },
      ],
      proof: ["TOPSTEPX · VANTAGE · BINANCE CSV IMPORT", "EVERY READ LABELLED BY SAMPLE SIZE", "NO BUILD STEP"],
      stack: "Vanilla JS · Node 22 on Vercel · PostgreSQL",
      heads: ["cmdbar", "cal", "session"],
      groups: [
        { label: "What the trader sees", feats: [
          { id: "cmdbar", t: "One-line trade logging", b: "Type the trade; see the risk before you press Enter.", v: { type: "cmd", prompt: "›", line: "usdjpy long 148.10 sl 147.80 0.5 lots", out: ["RISK $100", "R:R 2.4", "ENTER ↵"] } },
          { id: "live", t: "Live prices on open trades", b: "Watch every open position move as it happens.", v: { type: "rows", rows: [{ a: "XAUUSD · long", b: "+0.21%", tone: "ok" }, { a: "USDJPY · long", b: "+$86", tone: "ok" }, { a: "BTCUSD · short", b: "−$24", tone: "bad" }] } },
          { id: "close", t: "One-tap close and journal", b: "Mood, grade, mistakes, a note: done in seconds.", v: { type: "chips", items: ["A+", "A", "B", "C", "D", "F"], hi: 1, sub: ["Calm", "Late entry", "Voice note"] } },
          { id: "dash", t: "The desk at a glance", b: "P&L, streak, next event and risk state on one screen.", v: { type: "shot", src: P + "trader-journal-log.webp" } },
          { id: "cal", t: "Green and red days", b: "Click any day to see the trades behind it.", v: { type: "cal", days: "..g.grr.g....rg.gr.r...g...gr.." } },
          { id: "review", t: "Trade review with filters", b: "Find every Friday breakout loss in two clicks.", v: { type: "shot", src: P + "trader-journal-log.webp" } },
        ] },
        { label: "Insight", feats: [
          { id: "session", t: "Session intelligence", b: "Your best hours to trade, labelled developing or reliable.", v: { type: "heat", vals: [1, 0, 2, 9, 6, 2, 1, 0, 3, 1, 0, 2, 4, 5, 3, 1, 0, 1, 2, 3, 1, 0, 0, 1], hi: 3, tag: "3–4 AM · DEVELOPING · n=3" } },
          { id: "playbook", t: "Playbook by setup", b: "See which setups actually pay you.", v: { type: "bars", vals: [62, 28, 80, 45], labels: ["BRKOUT", "SCALP", "REVRSL", "TREND"], hi: 2 } },
          { id: "monthly", t: "Monthly review", b: "Close each month knowing what to repeat.", v: { type: "kpi", n: "+$1,160", sub: "SEPTEMBER · 8 GREEN · 5 RED", tone: "ok" } },
          { id: "reflect", t: "Daily reflection, weekly digest", b: "A few lines a day become a weekly lesson.", v: { type: "rows", rows: [{ a: "Mon · Waited for the retest", b: "CALM", tone: "ok" }, { a: "Tue · Chased the open", b: "FOMO", tone: "bad" }, { a: "Week 3 digest", b: "READY", tone: "acc" }] } },
          { id: "edgeclock", t: "Release-edge terminal", b: "A countdown to the next big release, with the news wire.", v: { type: "count", t: "00:46:12", label: "CPI M/M · HIGH IMPACT", wire: ["Fed speakers on deck", "Gold steady into CPI"] } },
        ] },
        { label: "Under the hood", feats: [
          { id: "imports", t: "Broker CSV imports", b: "Drop in a TopstepX, Vantage or Binance file; trades land in their days.", v: { type: "flow", steps: ["broker.csv", "Parse", "14 trades in"] } },
          { id: "feeds", t: "Live prices, three sources", b: "Binance, CoinGecko and gold-api keep the numbers honest.", v: { type: "chips", items: ["BINANCE", "COINGECKO", "GOLD-API"], hi: -1, sub: ["LIVE"] } },
          { id: "stack", t: "No build step", b: "Fast to load and simple to keep running.", v: { type: "term", lines: ["vanilla js", "node 22 · vercel", "postgresql"], total: "0 front-end deps" } },
        ] },
      ],
    },
    {
      id: "bookshop", name: "Miniature Bookshop", kind: "Custom ecommerce storefront", label: "CLIENT BUILD",
      accent: "#ffab98", railId: "BOOKSHOP//STORE", service: "Website",
      logo: { img: "public/logos/shop-mark.svg" },
      oneLine: "Miniature bookshelves and tiny books sold in sets of six. Storybook charm on the surface; underneath, a strict money path: every cart repriced on the server, branded order and gift card emails sent exactly once, and a shop that runs from its inbox.",
      short: "Build a tiny shelf of six books, pay by GCash. Charm on top, a strict money path below.",
      poster: P + "shop-hero.webp",
      feeds: [
        { label: "FEED 01", tag: "BUILD.SHELF", poster: P + "shop-build.webp", webm: P + "shop-feed-01.webm", mp4: P + "shop-feed-01.mp4" },
        { label: "FEED 02", tag: "MONEY.PATH", poster: P + "shop-money.webp", webm: P + "shop-feed-02.webm", mp4: P + "shop-feed-02.mp4" },
        { label: "FEED 03", tag: "CATALOG.LIVE", poster: P + "shop-catalog.webp", webm: P + "shop-feed-03.webm", mp4: P + "shop-feed-03.mp4" },
      ],
      how: [
        { t: "Pick a shelf", d: "Classic, Arched or Scalloped. Two sizes, nine colours." },
        { t: "Type six titles", d: "A hand-drawn shelf fills spine by spine as the customer types." },
        { t: "Dress the shelf", d: "A plant, a ladder, letters, a theme, a note. Progress saves itself." },
        { t: "Into the basket", d: "One bundle, six titles. The basket persists; the browser never sets a price." },
        { t: "Pay by transfer", d: "GCash or MariBank with one-tap copy and an order number to quote." },
      ],
      proof: ["EVERY CART REPRICED SERVER-SIDE", "BRANDED EMAILS, SENT EXACTLY ONCE", "92-CHECK PLAYWRIGHT SMOKE"],
      stack: "Next.js 16 · Tailwind 4 · Postgres on Neon",
      heads: ["six", "giftmail", "mailpay"],
      groups: [
        { label: "What shoppers see", feats: [
          { id: "builder", t: "Shelf builder", b: "Classic, Arched or Scalloped; two sizes; nine colours.", v: { type: "swatches", colors: ["#f2a593", "#efece6", "#5b4134", "#b9a3db", "#a9c79e", "#c9a46e", "#f0d77a", "#2c3e70", "#3a3a3e"], labels: ["Classic", "Arched", "Scalloped"], hi: 2 } },
          { id: "six", t: "Six titles, spine by spine", b: "Type a title and watch the little shelf fill.", v: { type: "shelf", n: 5, typing: "The Secret Garden" } },
          { id: "basket", t: "A basket that remembers", b: "Come back tomorrow; the shelf is still waiting.", v: { type: "rows", rows: [{ a: "Scalloped shelf · Sage", b: "₱645", tone: "mute" }, { a: "Six little books", b: "₱519", tone: "mute" }, { a: "Bundle", b: "₱1,164", tone: "acc" }] } },
          { id: "mailpay", t: "An order email that says how to pay", b: "Order number, the tiny things, the exact total and where to send it.", v: { type: "shot", src: P + "shop-mail-shopper-how-to-pay.webp", full: P + "shop-mail-shopper-how-to-pay-full.webp", phone: P + "shop-mail-shopper-how-to-pay-phone.webp" } },
          { id: "giftmail", t: "A gift card worth opening", b: "The friend gets an illustrated card, the code and how to use it.", v: { type: "shot", src: P + "shop-mail-gift-friend.webp", full: P + "shop-mail-gift-friend-full.webp", phone: P + "shop-mail-gift-friend-phone.webp" } },
          { id: "promo", t: "A promo email that sells", b: "10.10: ₱100 off and free shipping, with the code already in the link.", v: { type: "shot", src: P + "shop-mail-promo.webp", full: P + "shop-mail-promo-full.webp", phone: P + "shop-mail-promo-phone.webp" } },
        ] },
        { label: "What the shop gets", feats: [
          { id: "transfer", t: "Paid by GCash or MariBank", b: "Paid the way the shop already sells. No gateway fees, no cards.", v: { type: "shot", src: P + "shop-money.webp" } },
          { id: "mailshop", t: "A new-order alert in the inbox", b: "Customer, address, items and the total to expect, the moment it lands.", v: { type: "shot", src: P + "shop-mail-shop-new-order.webp", full: P + "shop-mail-shop-new-order-full.webp", phone: P + "shop-mail-shop-new-order-phone.webp" } },
          { id: "mailproof", t: "Payment screenshots, straight to the shop", b: "The shopper uploads the transfer; the shop gets it attached to the order.", v: { type: "shot", src: P + "shop-mail-shop-payment-proof.webp", full: P + "shop-mail-shop-payment-proof-full.webp", phone: P + "shop-mail-shop-payment-proof-phone.webp" } },
          { id: "digest", t: "New readers, 25 at a time", b: "One tidy digest of sign-ups and where they found the shop.", v: { type: "shot", src: P + "shop-mail-subscriber-digest.webp", full: P + "shop-mail-subscriber-digest-full.webp" } },
          { id: "cli", t: "The shop runs from one command", b: "Orders, shipping, subscribers and promos from the owner’s terminal.", v: { type: "term", lines: ["npm run shop orders", "npm run shop ship LB1812 …", "npm run shop promo send"], plain: true } },
        ] },
        { label: "Under the hood", feats: [
          { id: "reprice", t: "Every cart repriced on the server", b: "The browser never decides a price.", v: { type: "flow", steps: ["Basket", "Server reprice", "₱1,164"] } },
          { id: "emails", t: "Order emails sent exactly once", b: "Each order claims its send; a failed send gives the claim back.", v: { type: "rows", rows: [{ a: "To the shopper", b: "SENT ×1", tone: "ok" }, { a: "To the shop", b: "SENT ×1", tone: "ok" }, { a: "Send failed", b: "CLAIM RELEASED", tone: "warn" }] } },
          { id: "status", t: "An order that knows where it is", b: "Awaiting payment, submitted, confirmed, preparing, shipped, completed.", v: { type: "flow", steps: ["Awaiting", "Paid", "Shipped"] } },
          { id: "smoke", t: "92-check purchase test", b: "Playwright walks the whole money path on a phone-sized screen.", v: { type: "term", lines: ["build a shelf", "basket persists", "server reprice", "emails sent ×1"], total: "92 checks" } },
          { id: "stackb", t: "A stack it won’t outgrow", b: "Next.js 16, Tailwind 4 and Postgres on Neon.", v: { type: "chips", items: ["NEXT.JS 16", "TAILWIND 4", "NEON POSTGRES"], hi: -1 } },
        ] },
      ],
    },
  ];

  /* ==========================================================
     SELECTED WORK :: bento wall → feature map → case file
     Four tiles. A tile grows into a full-screen map of who
     meets which feature; the case file and the index of other
     builds open over it.
     ========================================================== */
  const isPhone = () => innerWidth < 1000;
  // every screenshot is shown whole: contained, over a blurred copy of itself
  // url() in a custom property resolves against the stylesheet, so hand it absolute URLs
  const bgUrl = (u) => `url('${new URL(u, document.baseURI).href}')`;
  // every image has a 640px WebP twin in thumb/: small frames show it, and the blurred backdrop always uses it
  const thumb = (u) => u.replace("public/projects/", "public/projects/thumb/").replace(/\.(jpe?g|webp)(\?.*)?$/, ".webp");
  const fit = (src, alt = "", small = false) => `<span class="fit" style="--src:${bgUrl(thumb(src))}"><img src="${small ? thumb(src) : src}" alt="${alt}" loading="lazy" decoding="async" /></span>`;

  const WHO = ["CUSTOMER", "OWNER", "BEHIND IT"];
  const VERBS = ["TAPS INTO", "REPORTS TO", "RUNS ON"];
  WORK.forEach((p) => {
    p.byId = {};
    p.groups.forEach((g, gi) => g.feats.forEach((f) => { f.gi = gi; p.byId[f.id] = f; }));
  });

  // ---- feature visuals: one small, honest picture per feature
  const TONE = { ok: "#34d399", bad: "#f87171", warn: "#e9b44c", mute: "#9ba0ab" };
  const tone = (t) => (t === "acc" ? "var(--acc)" : TONE[t] || "#9ba0ab");
  // big: the opened-up view; long: a tall slot (phone card), where a full email reads better than a crop
  const viz = (v, big, long) => {
    const t = v.type;
    const st = (i) => `style="--i:${i}"`;
    let h = "";
    if (t === "shot" || t === "photo") {
      const tall = big ? v.full : long ? v.phone || v.full : null;
      h = tall ? `<span class="vz-scroll"><img src="${tall}" alt="" loading="lazy" /><em>SCROLL TO READ ↓</em></span>` : fit(v.src, "", !big && !long);
    } else if (t === "cmd") {
      h = `<div class="vz-cmd"><div class="vz-cmd__bar"><b>${v.prompt}</b><span class="vz-cmd__line" style="--n:${v.line.length}">${v.line}</span><i></i></div>
        <div class="vz-cmd__out">${v.out.map((o, i) => `<span ${st(i)}>${o}</span>`).join("")}</div></div>`;
    } else if (t === "score") {
      h = `<div class="vz-score"><div><div class="vz-score__n">${v.n}<small>/${v.of}</small></div>
        <div class="vz-score__dots">${Array.from({ length: v.of }, (_, i) => `<span class="${i < v.n ? "on" : ""}" ${st(i)}></span>`).join("")}</div></div>
        <div class="vz-score__ev">${v.ev.map((e, i) => `<p ${st(i)}><b>◆</b>${e}</p>`).join("")}</div></div>`;
    } else if (t === "rows") {
      h = `<div class="vz-rows">${v.rows.map((r, i) => `<p ${st(i)}><span>${r.a}</span><b style="color:${tone(r.tone)}">${r.b}</b></p>`).join("")}</div>`;
    } else if (t === "gate") {
      h = `<div class="vz-gate">${v.steps.map((s, i) => {
        const cls = i === v.lock ? "lock" : i === v.lock - 1 ? "human" : "done";
        return `<div class="vz-gate__s vz-gate__s--${cls}" ${st(i)}><b>${cls === "lock" ? "■" : cls === "done" ? "✓" : "●"}</b><span>${s}</span></div>${i < v.steps.length - 1 ? "<em>→</em>" : ""}`;
      }).join("")}</div>`;
    } else if (t === "flow") {
      h = `<div class="vz-flow">${v.steps.map((s, i) => `<span class="vz-flow__s${i === v.steps.length - 1 ? " is-end" : ""}" ${st(i)}>${s}</span>${i < v.steps.length - 1 ? `<i ${st(i)}></i>` : ""}`).join("")}</div>`;
    } else if (t === "term") {
      h = `<div class="vz-term">${v.lines.map((l, i) => `<p ${st(i)}><b>✓</b> ${l}</p>`).join("")}${v.total ? `<p class="vz-term__total" ${st(v.lines.length)}>▸ ${v.total}</p>` : ""}</div>`;
    } else if (t === "chips") {
      h = `<div class="vz-chips"><div>${v.items.map((c, i) => `<span class="${i === v.hi ? "on" : ""}" ${st(i)}>${c}</span>`).join("")}</div>
        ${v.sub ? `<p>${v.sub.map((s) => `<span>+ ${s}</span>`).join("")}</p>` : ""}</div>`;
    } else if (t === "bars") {
      const m = Math.max(...v.vals);
      h = `<div class="vz-bars">${v.tag ? `<p>${v.tag}</p>` : ""}<div>${v.vals.map((x, i) => `<span class="${i === v.hi ? "on" : ""}" style="--h:${Math.round((x / m) * 100)}%;--i:${i}"><i></i>${v.labels ? `<em>${v.labels[i]}</em>` : ""}</span>`).join("")}</div></div>`;
    } else if (t === "cal") {
      h = `<div class="vz-cal">${v.days.split("").map((d, i) => `<span class="${d === "g" ? "g" : d === "r" ? "r" : ""}" style="--i:${i}">${i + 1}</span>`).join("")}</div>`;
    } else if (t === "heat") {
      const m = Math.max(...v.vals);
      h = `<div class="vz-heat"><div>${v.vals.map((x, i) => `<span class="${i === v.hi ? "hi" : ""}" style="--a:${x ? 0.15 + (x / m) * 0.85 : 0};--i:${i}"></span>`).join("")}</div>
        <p class="vz-heat__axis"><span>00</span><span>06</span><span>12</span><span>18</span><span>23</span></p><p class="vz-heat__tag">${v.tag}</p></div>`;
    } else if (t === "kpi") {
      h = `<div class="vz-kpi"><b style="color:${tone(v.tone)}">${v.n}</b><span>${v.sub}</span></div>`;
    } else if (t === "count") {
      h = `<div class="vz-count"><div><span>${v.label}</span><b data-countdown="${v.t}">${v.t}</b></div><div>${v.wire.map((w) => `<p>WIRE · ${w}</p>`).join("")}</div></div>`;
    } else if (t === "swatches") {
      h = `<div class="vz-sw"><div>${v.colors.map((c, i) => `<span style="background:${c};--i:${i}"></span>`).join("")}</div><p>${v.labels.map((l, i) => `<em class="${i === v.hi ? "on" : ""}">${l}</em>`).join("")}</p></div>`;
    } else if (t === "shelf") {
      const pal = ["#c98f86", "#8fae8a", "#e2c27a", "#b07b6e", "#9fb4c9", "#d9a5a0"];
      const hs = [86, 72, 92, 78, 88, 80];
      h = `<div class="vz-shelf"><div class="vz-shelf__case">${pal.map((c, i) => `<span class="${i < v.n ? "" : "empty"}" style="--c:${c};--h:${hs[i]}%;--i:${i}"></span>`).join("")}</div>
        <div class="vz-shelf__side"><p>${v.n} of 6 chosen</p><div class="vz-shelf__in"><span class="vz-cmd__line" style="--n:${v.typing.length}">${v.typing}</span><i></i></div></div></div>`;
    }
    return `<span class="vz vz--${t}${v.tall ? " vz--tall" : ""}${big ? " vz--big" : ""}">${h}</span>`;
  };

  // visuals animate in once they are on screen
  const vizObserver = new IntersectionObserver((ents) => {
    ents.forEach((en) => { if (en.isIntersecting) { en.target.classList.add("is-on"); vizObserver.unobserve(en.target); } });
  }, { threshold: 0.3 });
  const armViz = (root) => root.querySelectorAll(".vz:not(.is-on)").forEach((el) => vizObserver.observe(el));

  const logoHTML = (p) => `<span class="wlogo">${p.logo.svg || `<img src="${p.logo.img}" alt="" />`}</span>`;
  const sources = (f) => `${f.webm ? `<source src="${f.webm}" type="video/webm" />` : ""}<source src="${f.mp4}" type="video/mp4" />`;

  // ---- the wall
  const wall = document.getElementById("wall");
  wall.innerHTML = WORK.map((p, i) => `
    <article class="wtile" role="listitem" style="--acc:${p.accent}">
      <button type="button" class="wtile__btn" data-open="${i}" aria-label="Open ${p.name}: ${p.kind}">
        <span class="wtile__media">${fit(p.poster)}</span>
        <span class="wtile__shade" aria-hidden="true"></span>
        <span class="wtile__corner" aria-hidden="true"></span>
        <span class="wtile__rail" aria-hidden="true">
          <span class="wtile__chip"><i></i>0${i + 1}<span class="wtile__rid"> · ${p.railId}</span></span>
          <span class="wtile__tag">${p.label}</span>
        </span>
        <span class="wtile__body">
          <span class="wtile__text">
            <span class="wtile__brand">${logoHTML(p)}<span class="wtile__kind">${p.kind}</span></span>
            <span class="wtile__name">${p.name}</span>
            <span class="wtile__line">${p.short}</span>
            <span class="wtile__heads" aria-hidden="true">${p.heads.map((id) => `<span class="wtile__head"><span class="wtile__viz">${viz(p.byId[id].v)}</span><span class="wtile__cap">${p.byId[id].t}</span></span>`).join("")}</span>
          </span>
          <span class="wtile__arrow" aria-hidden="true">↗</span>
        </span>
      </button>
    </article>`).join("") + `
    <button type="button" class="wmore" id="wmore" aria-label="Open the index of ${PROJECTS.length} more builds">
      <span class="wmore__title"><b>+${PROJECTS.length} more builds</b><small>SITES · AI SYSTEMS · PRODUCTS</small></span>
      <span class="wmore__strip" aria-hidden="true">${PROJECTS.map((b) => fit(b.image, "", true)).join("")}</span>
      <span class="wmore__arrow" aria-hidden="true">↗</span>
    </button>`;
  armViz(wall);
  const tiles = [...wall.querySelectorAll(".wtile__btn")];

  // desktop: a tile plays its first feed while hovered
  if (isFinePointer && !prefersReducedMotion) {
    tiles.forEach((btn, i) => {
      const f = WORK[i].feeds[0];
      if (!f.mp4) return;
      let vid = null;
      btn.addEventListener("mouseenter", () => {
        if (!vid) {
          vid = document.createElement("video");
          vid.muted = true; vid.loop = true; vid.playsInline = true; vid.preload = "auto";
          vid.innerHTML = sources(f);
          if (f.start) vid.addEventListener("loadedmetadata", () => { vid.currentTime = f.start; }, { once: true });
          btn.querySelector(".wtile__media").appendChild(vid);
        }
        vid.play().then(() => vid.classList.add("is-playing")).catch(() => {});
      });
      btn.addEventListener("mouseleave", () => { if (vid) { vid.pause(); vid.classList.remove("is-playing"); } });
    });
  }

  // ---- overlays share one scroll lock
  let locks = 0;
  const lock = (on) => {
    locks = Math.max(0, locks + (on ? 1 : -1));
    document.documentElement.classList.toggle("is-locked", locks > 0);
  };

  // ---- the feature map
  const fmap = document.getElementById("fmap");
  const S = { open: -1, node: null, card: 0, feed: 0 };
  let lastTile = null;

  const rectOf = (i) => {
    const r = tiles[i].getBoundingClientRect();
    return { l: r.left, t: r.top, w: r.width, h: r.height };
  };
  const setBox = (r) => {
    fmap.style.left = r ? r.l + "px" : "0px";
    fmap.style.top = r ? r.t + "px" : "0px";
    fmap.style.width = r ? r.w + "px" : "100%";
    fmap.style.height = r ? r.h + "px" : "100%";
    fmap.style.borderRadius = r ? "18px" : "0px";
  };

  const hubMedia = (p) => {
    const f = p.feeds[S.feed];
    return f.mp4
      ? `<span class="fit" style="--src:${bgUrl(f.poster)}"><video class="fm-hub__video" muted playsinline loop preload="metadata" poster="${f.poster}" aria-label="${p.name} screen capture">${sources(f)}</video></span>`
      : fit(f.poster, `${p.name}, ${f.tag.toLowerCase()}`);
  };
  const feedsHTML = (p) => `<div class="fm-feeds" role="tablist" aria-label="${p.name} footage">${p.feeds.map((f, i) => `
      <button type="button" role="tab" aria-selected="${i === S.feed}" class="fm-feed${i === S.feed ? " is-on" : ""}" data-feed="${i}">
        ${fit(f.poster, "", true)}<span>${f.label}</span>
      </button>`).join("")}</div>`;

  const deckOf = (p) => {
    const d = [{ hub: true, stage: 0, kick: "THE PRODUCT · " + p.label, t: p.name, b: p.short }];
    p.groups.forEach((g, gi) => g.feats.forEach((f) => d.push({ f, stage: gi + 1, kick: `0${gi + 1} · ${WHO[gi]} · ${g.label.toUpperCase()}`, t: f.t, b: f.b })));
    return d;
  };

  function renderMap() {
    const p = WORK[S.open];
    fmap.style.setProperty("--acc", p.accent);
    fmap.setAttribute("aria-label", `${p.name} feature map`);
    const bar = `
      <div class="fm-bar">
        <button type="button" class="fm-back" data-act="close" aria-label="Back to the wall">←<span> WALL · ESC</span></button>
        <div class="fm-title">${logoHTML(p)}<b>${p.name}</b><span class="fm-title__kind">${p.kind}</span></div>
        <div class="fm-step">
          <button type="button" data-act="prev" aria-label="Previous product">←</button>
          <span class="fm-step__pos">0${S.open + 1} / 0${WORK.length}</span>
          <button type="button" data-act="next" aria-label="Next product">→</button>
        </div>
        <button type="button" class="fm-case" data-act="case">CASE FILE <span>↗</span></button>
        <button type="button" class="fm-build" data-act="build">Build something like this →</button>
      </div>`;
    let body;
    if (!isPhone()) {
      const group = (g, gi) => `
        <section class="fm-col" style="--n:${g.feats.length}">
          <header><p>0${gi + 1} · ${WHO[gi]}</p><h4>${g.label}</h4></header>
          <div class="fm-nodes">${g.feats.map((f, k) => `
            <button type="button" class="fm-node${S.node === f.id ? " is-sel" : ""}" data-node="${f.id}" style="--k:${k}" aria-pressed="${S.node === f.id}">
              <span class="fm-node__viz">${viz(f.v)}</span>
              <span class="fm-node__txt"><b>${f.t}</b><small>${f.b}</small></span>
            </button>`).join("")}</div>
        </section>`;
      const wire = (i) => `<div class="fm-wire" aria-hidden="true"><span>${VERBS[i]}</span><i></i></div>`;
      body = `
        <div class="fm-map">
          ${group(p.groups[0], 0)}${wire(0)}
          <section class="fm-hub">
            <p class="fm-hub__kick">THE PRODUCT</p>
            <div class="fm-hub__stage">${hubMedia(p)}<span class="fm-hub__rec"><i></i>${p.feeds[S.feed].label} // ${p.feeds[S.feed].tag}</span></div>
            ${feedsHTML(p)}
            <p class="fm-hub__line">${p.oneLine}</p>
            <div class="fm-chips">${p.proof.map((c, i) => `<span style="--i:${i}">${c}</span>`).join("")}</div>
            <ol class="fm-how" aria-label="How ${p.name} works">${p.how.map((h, k) => `<li style="--k:${k}"><b>0${k + 1}</b><span><strong>${h.t}.</strong> ${h.d}</span></li>`).join("")}</ol>
          </section>
          ${wire(1)}${group(p.groups[1], 1)}${wire(2)}${group(p.groups[2], 2)}
        </div>`;
    } else {
      const deck = deckOf(p);
      S.card = Math.min(S.card, deck.length - 1);
      const c = deck[S.card];
      const stages = ["Product", "Customer", "Owner", "Behind"];
      body = `
        <div class="fm-deck">
          <div class="fm-tabs" role="tablist" aria-label="Feature map stages">${stages.map((t, si) => `
            <button type="button" role="tab" aria-selected="${c.stage === si}" class="${c.stage === si ? "is-on" : ""}" data-stage="${si}"><small>${si ? p.groups[si - 1].feats.length + " FEATURES" : "OVERVIEW"}</small>${t}</button>`).join("")}
          </div>
          <div class="fm-card" role="group" aria-roledescription="card" aria-label="${c.t}, card ${S.card + 1} of ${deck.length}">
            <div class="fm-card__media">${c.hub ? hubMedia(p) : viz(c.f.v, false, true)}</div>
            ${c.hub ? feedsHTML(p) : ""}
            <div class="fm-card__txt"><p>${c.kick}</p><h3>${c.t}</h3><span>${c.b}</span></div>
          </div>
          <div class="fm-ctrl">
            <button type="button" data-act="cprev" aria-label="Previous card">←</button>
            <span aria-live="polite">${S.card + 1}/${deck.length}</span>
            <button type="button" data-act="cnext" aria-label="Next card">→</button>
            <button type="button" class="fm-case" data-act="case">CASE FILE ↗</button>
            <button type="button" class="fm-build" data-act="build" aria-label="Build something like this">Build</button>
          </div>
        </div>`;
    }
    fmap.innerHTML = `<div class="fm-in">${bar}${body}</div>`;
    if (!isPhone()) renderNode();
    fmap.querySelectorAll(".vz").forEach((el) => requestAnimationFrame(() => el.classList.add("is-on")));
    const v = fmap.querySelector(".fm-hub__video");
    if (v && !prefersReducedMotion) { v.muted = true; v.play().catch(() => {}); }
  }

  // the opened-up feature sits over the map, so the map (and its film) keep running
  function renderNode() {
    const p = WORK[S.open];
    const old = fmap.querySelector(".fm-node-over");
    if (old) old.remove();
    fmap.querySelectorAll(".fm-node").forEach((b) => {
      const on = b.dataset.node === S.node;
      b.classList.toggle("is-sel", on);
      b.setAttribute("aria-pressed", String(on));
    });
    const N = S.node && p.byId[S.node];
    if (!N) return;
    fmap.querySelector(".fm-in").insertAdjacentHTML("beforeend", `
      <div class="fm-node-over" data-act="clearnode">
        <div class="fm-detail" role="dialog" aria-label="${N.t}">
          <div class="fm-detail__viz">${viz(N.v, true)}</div>
          <div class="fm-detail__foot">
            <div><p>0${N.gi + 1} · ${WHO[N.gi]} · ${p.groups[N.gi].label.toUpperCase()}</p><h3>${N.t}</h3><span>${N.b}</span></div>
            <button type="button" data-act="clearnode">ESC · MAP</button>
          </div>
        </div>
      </div>`);
    const d = fmap.querySelector(".fm-detail .vz");
    requestAnimationFrame(() => d.classList.add("is-on"));
  }

  function openTile(i, node) {
    lastTile = tiles[i];
    const k = node ? deckOf(WORK[i]).findIndex((c) => c.f && c.f.id === node) : 0;
    Object.assign(S, { open: i, node: node && !isPhone() ? node : null, card: Math.max(0, k), feed: 0 });
    renderMap();
    fmap.hidden = false;
    lock(true);
    if (prefersReducedMotion) { setBox(null); fmap.classList.add("is-full"); }
    else {
      fmap.classList.remove("is-full");
      fmap.classList.add("is-moving");
      setBox(rectOf(i));
      requestAnimationFrame(() => requestAnimationFrame(() => { setBox(null); fmap.classList.add("is-full"); }));
      setTimeout(() => fmap.classList.remove("is-moving"), 560);
    }
    fmap.querySelector(".fm-back").focus({ preventScroll: true });
  }
  // set when the map or the index was opened from the quick view: closing goes back there, not to the page
  let backToDeck = false;
  function closeTile() {
    if (S.open < 0) return;
    const i = S.open;
    fmap.querySelectorAll("video").forEach((v) => v.pause());
    const done = () => { fmap.hidden = true; fmap.innerHTML = ""; S.open = -1; lock(false); tiles[i].focus({ preventScroll: true }); };
    if (backToDeck) { backToDeck = false; showDeck(); done(); return; }
    if (prefersReducedMotion) return done();
    fmap.classList.add("is-moving");
    fmap.classList.remove("is-full");
    setBox(rectOf(i));
    setTimeout(() => { fmap.classList.remove("is-moving"); done(); }, 520);
  }
  const stepProduct = (d) => {
    Object.assign(S, { open: (S.open + d + WORK.length) % WORK.length, node: null, card: 0, feed: 0 });
    lastTile = tiles[S.open];
    renderMap();
  };
  const stepCard = (d) => {
    const n = deckOf(WORK[S.open]).length;
    S.card = (S.card + d + n) % n;
    renderMap();
  };

  tiles.forEach((b, i) => b.addEventListener("click", () => openTile(i)));
  fmap.addEventListener("click", (e) => {
    const t = e.target.closest("[data-act],[data-node],[data-feed],[data-stage]");
    if (!t) return;
    if (t.dataset.node) { S.node = S.node === t.dataset.node ? null : t.dataset.node; renderNode(); return; }
    if (t.dataset.feed) { S.feed = +t.dataset.feed; renderMap(); return; }
    if (t.dataset.stage) { const k = deckOf(WORK[S.open]).findIndex((c) => c.stage === +t.dataset.stage); S.card = Math.max(0, k); renderMap(); return; }
    const act = t.dataset.act;
    if (act === "clearnode") { if (e.target.closest(".fm-detail") && t.classList.contains("fm-node-over")) return; S.node = null; renderNode(); }
    else if (act === "close") closeTile();
    else if (act === "prev") stepProduct(-1);
    else if (act === "next") stepProduct(1);
    else if (act === "cprev") stepCard(-1);
    else if (act === "cnext") stepCard(1);
    else if (act === "case") openCase(S.open);
    else if (act === "build") openWizard(WORK[S.open].service);
  });
  let tx = 0;
  fmap.addEventListener("touchstart", (e) => { tx = e.touches[0].clientX; }, { passive: true });
  fmap.addEventListener("touchend", (e) => {
    if (!e.target.closest(".fm-card")) return;
    const dx = e.changedTouches[0].clientX - tx;
    if (Math.abs(dx) > 40) stepCard(dx < 0 ? 1 : -1);
  }, { passive: true });
  let lastPhone = isPhone();
  addEventListener("resize", () => {
    if (S.open < 0 || isPhone() === lastPhone) return;
    lastPhone = isPhone();
    renderMap();
  }, { passive: true });

  // ---- the case file
  const casefile = document.getElementById("casefile");
  function openCase(i) {
    const p = WORK[i];
    casefile.style.setProperty("--acc", p.accent);
    casefile.innerHTML = `
      <div class="cf-panel" role="document">
        <div class="cf-media">${fit(p.cover || p.poster, p.name)}<span class="cf-corner" aria-hidden="true"></span></div>
        <div class="cf-body">
          <p class="cf-rail"><i></i>${p.railId} · CASE FILE<span>${p.label}</span></p>
          <div class="cf-head">${logoHTML(p)}<div><h3>${p.name}</h3><p>${p.kind} · ${p.stack}</p></div></div>
          <p class="cf-copy">${p.oneLine}</p>
          <ol class="cf-how">${p.how.map((s, k) => `<li><b>0${k + 1}</b><span><strong>${s.t}</strong><small> · ${s.d}</small></span></li>`).join("")}</ol>
          <div class="fm-chips">${p.proof.map((c, k) => `<span style="--i:${k}">${c}</span>`).join("")}</div>
          <div class="cf-actions">
            <button type="button" class="cf-build" data-act="build">Build something like this →</button>
            ${p.url ? `<a class="cf-visit" href="${p.url}" target="_blank" rel="noopener">Visit ${p.url.replace("https://", "")} ↗</a>` : ""}
            <button type="button" class="cf-close" data-act="close" aria-label="Close case file">ESC · CLOSE</button>
          </div>
        </div>
      </div>`;
    casefile.hidden = false;
    lock(true);
    casefile.querySelector(".cf-close").focus({ preventScroll: true });
  }
  const closeCase = () => { if (casefile.hidden) return; casefile.hidden = true; lock(false); };
  casefile.addEventListener("click", (e) => {
    const t = e.target.closest("[data-act]");
    if (e.target === casefile || (t && t.dataset.act === "close")) closeCase();
    else if (t && t.dataset.act === "build") { const svc = WORK[S.open >= 0 ? S.open : 0].service; closeCase(); openWizard(svc); }
  });

  // ---- the index of every other build
  const moreidx = document.getElementById("moreidx");
  moreidx.innerHTML = `
    <div class="mi-head">
      <div><p>INDEX // ${PROJECTS.length} MORE BUILDS</p><h3>Range, not just flagships.</h3></div>
      <button type="button" class="mi-close" data-act="close" aria-label="Close the index">ESC · CLOSE</button>
    </div>
    <div class="mi-grid">${PROJECTS.map((b, i) => `
      <button type="button" class="mi-card" data-build="${i}" style="--acc:${b.accent}" aria-label="${b.name}, ${b.type}">
        <span class="mi-card__img">${fit(b.image, "", true)}</span>
        <span class="mi-card__cap"><b><i></i>${b.name}</b><small>${b.type}</small></span>
      </button>`).join("")}
    </div>`;
  const openMore = () => { moreidx.hidden = false; lock(true); moreidx.querySelector(".mi-close").focus({ preventScroll: true }); };
  const closeMore = () => {
    if (moreidx.hidden) return;
    moreidx.hidden = true;
    lock(false);
    if (backToDeck) { backToDeck = false; showDeck(); } else document.getElementById("wmore").focus({ preventScroll: true });
  };
  document.getElementById("wmore").addEventListener("click", openMore);
  moreidx.addEventListener("click", (e) => {
    const b = e.target.closest("[data-build]");
    if (b) { openModal(+b.dataset.build); return; }
    if (e.target.closest("[data-act=close]")) closeMore();
  });

  // ---- keys: 1–4 open, ← → step, Esc backs out one layer
  addEventListener("keydown", (e) => {
    if (document.getElementById("wizard").classList.contains("is-open") || modal.classList.contains("is-open")) return;
    if (/^(INPUT|TEXTAREA|SELECT)$/.test(e.target.tagName) || e.metaKey || e.ctrlKey || e.altKey || D.on) return;
    if (e.key === "Escape") {
      if (!casefile.hidden) closeCase();
      else if (!moreidx.hidden) closeMore();
      else if (S.open >= 0 && S.node) { S.node = null; renderNode(); }
      else if (S.open >= 0) closeTile();
      return;
    }
    if (!casefile.hidden || !moreidx.hidden) return;
    if (/^[1-4]$/.test(e.key)) {
      const k = +e.key - 1;
      if (S.open >= 0) { Object.assign(S, { open: k, node: null, card: 0, feed: 0 }); renderMap(); return; }
      const r = wall.getBoundingClientRect();
      if (r.top < innerHeight * 0.6 && r.bottom > innerHeight * 0.4) openTile(k);
    } else if (S.open >= 0 && (e.key === "ArrowRight" || e.key === "ArrowLeft")) {
      e.preventDefault();
      const d = e.key === "ArrowRight" ? 1 : -1;
      isPhone() ? stepCard(d) : stepProduct(d);
    }
  });

  /* ==========================================================
     QUICK VIEW :: the whole studio on one calm screen ("The Brief")
     Desktop is laid out at 1280×800 and scaled to fit the window,
     so nothing is ever cut; phones get a single scrolling column.
     ========================================================== */
  const QV_POSTER = { tapfour: "tapfour-dash-home.webp", aegis: "aegis-leados-pipeline.webp", bookshop: "shop-catalog.webp" };
  const QV_BUILD = [
    ["Websites", "Sites + stores: custom, Shopify, WordPress", "Website"],
    ["Custom software", "Apps made for your business", "Digital Product"],
    ["Dashboards", "Your numbers, live", "Business System"],
    ["Internal tools", "Run your team in one place", "Business System"],
    ["Automation & AI", "AI support for stores, clinics and more", "AI Automation", true],
  ];
  const QV_STEPS = [["Brief", "You tell me what you need."], ["Plan", "I send back the plan."], ["Build", "You see it come together."], ["Launch", "It goes live. I look after it."]];
  const QV_ASK = [
    ["What can you build?", "Websites, custom software, dashboards, internal tools and automations."],
    ["Done this before?", "20+ systems shipped. Four are live products you can click through right now."],
    ["How does it work?", "Four steps: you send a short brief, I come back with a plan, I build it, then I keep it running."],
    ["Cost and timing?", "Send a short brief and you get the scope, the price and a date back. Nothing starts until you agree."],
    ["After launch?", "I stay on it: fixes, updates and new features as the business grows."],
  ];
  const QV_IDEAS = [
    ["WEBSITE + PAYMENTS", "A website that takes payment, emails the customer a receipt and alerts me the moment it lands.", "Website"],
    ["BOOKINGS", "A booking page that sends reminders, so clients stop missing appointments.", "Website"],
    ["DASHBOARD", "One screen with sales from all three branches, updated live.", "Business System"],
    ["AUTOMATION", "Every enquiry saved as a lead and followed up automatically.", "AI Automation"],
    ["INTERNAL TOOL", "A stock tracker that warns me before anything runs out.", "Business System"],
    ["WEBSITE", "An online menu I can update from my phone in seconds.", "Website"],
    ["STAFF PORTAL", "One place for schedules, leave requests and payslips.", "Business System"],
    ["REPORTING", "A weekly report that writes itself and lands in my inbox every Monday.", "AI Automation"],
  ];
  const IDEA_MS = 10000, TYPE_MS = 1900;

  const deckEl = document.getElementById("deck");
  const D = { p: 0, q: 0, brief: "", briefSvc: undefined, on: false, t0: 0, idea: -1 };
  const deckMob = () => innerWidth < 760 || innerWidth < innerHeight * 0.8;
  const kick = (n, t) => `<p class="qv-kick"><b>${n}</b><i></i>${t}</p>`;

  function renderDeck() {
    const cur = WORK[D.p];
    deckEl.innerHTML = `
      <div class="qv-stage">
        <header class="qv-head">
          <span class="qv-brand"><b>Chester</b><small>STUDIO</small></span>
          <a class="qv-mail" href="mailto:chestercatapia08@gmail.com">chestercatapia08@gmail.com</a>
          <button type="button" class="qv-full" data-qv="site">FULL SITE <span>→</span></button>
        </header>
        <div class="qv-cols">
          <section class="qv-col qv-profile">
            ${kick("01", "PROFILE")}
            <h1>I build the systems <span>your business runs on.</span></h1>
            <p class="qv-lead">Websites, software, dashboards and automations. Designed, built and looked after.</p>
            <div class="qv-idea" role="button" tabindex="0" data-qv="nextidea" aria-label="Show another idea">
              <div class="qv-idea__top"><span class="qv-idea__tag"></span><span class="qv-idea__num"></span><button type="button" class="qv-idea__use" data-qv="useidea">Use this →</button></div>
              <p class="qv-idea__txt" aria-live="polite">“<span></span>”</p>
              <span class="qv-idea__bar"></span>
            </div>
            <div class="qv-brief">
              <textarea id="qvBrief" rows="3" aria-label="What do you need built?" placeholder="What do you need built?">${D.brief.replace(/</g, "&lt;")}</textarea>
              <div class="qv-brief__go"><button type="button" class="qv-send" data-qv="send">Send brief →</button><a class="qv-direct" href="mailto:chestercatapia08@gmail.com">or email directly</a></div>
            </div>
          </section>
          <section class="qv-col qv-work">
            ${kick("02", "SELECTED WORK")}
            <button type="button" class="qv-shot" data-qv="openp" aria-label="Open ${cur.name} on the full site">${fit(QV_POSTER[cur.id] ? P + QV_POSTER[cur.id] : cur.poster, cur.name)}<span class="qv-shot__hint">Open ${cur.name} ↗</span></button>
            <div class="qv-list">${WORK.map((x, i) => `
              <button type="button" class="qv-row${i === D.p ? " is-on" : ""}" data-qv-p="${i}" aria-pressed="${i === D.p}">
                <small>0${i + 1}</small>
                <span><b>${x.name}</b><em>${x.kind}</em></span>
                <small class="qv-row__cat">${x.service.toUpperCase()}</small>
                <i>→</i>
              </button>`).join("")}
            </div>
            <button type="button" class="qv-more" data-qv="more">+${PROJECTS.length} more builds on the full site →</button>
          </section>
          <section class="qv-col qv-side">
            ${kick("03", "WHAT I BUILD")}
            <div class="qv-build">${QV_BUILD.map(([t, o, , hot], i) => `
              <button type="button" data-qv-b="${i}"${hot ? ' class="is-hot" aria-label="Automation and AI: see three AI client cases"' : ""}><span><b>${t}${hot ? "<small>3 AI CASES</small>" : ""}</b><em>${o}</em></span><i>→</i></button>`).join("")}
            </div>
            ${kick("04", "HOW IT WORKS")}
            <div class="hw" id="qvHow">
              <div class="hw-win">
                <div class="hw-bar"><span class="hw-lights"><i></i><i></i><i></i></span><span class="hw-addr"><i class="hw-dot"></i><span class="hw-urls"><em>new message</em><em>plan · draft 1</em><em>preview link</em><em>yourclinic.com</em></span></span></div>
                <div class="hw-view"><div class="hw-canvas">
                  <div class="hw-note"><small>YOUR BRIEF</small><p><span class="hw-typed"></span><i></i></p></div>
                  <span class="hw-w hw-w--nav" style="left:16px;top:14px;width:432px;height:26px;--k:0"><em>NAV</em><span class="hw-c"><span class="hw-navc"><b>Your Clinic</b><i></i><i></i><i></i></span></span></span><span class="hw-w" style="left:16px;top:52px;width:220px;height:32px;--k:1"><em>HEADLINE</em><span class="hw-c"><b class="hw-h1">Book your visit</b></span></span><span class="hw-w" style="left:16px;top:90px;width:180px;height:20px;--k:2"><em>INTRO</em><span class="hw-c"><span class="hw-p">Same-week appointments.</span></span></span><span class="hw-w hw-w--btn" style="left:16px;top:118px;width:110px;height:30px;--k:3"><em>BUTTON</em><span class="hw-c"><b class="hw-btn">Book a time</b></span></span><span class="hw-w hw-w--cal" style="left:262px;top:52px;width:186px;height:112px;--k:4"><em>BOOKING CALENDAR</em><span class="hw-c"><span class="hw-cal"><small>OCTOBER</small><span>${Array.from({ length: 15 }, (_, i) => `<i class="${i === 8 ? "pick" : i === 2 || i === 11 ? "taken" : ""}"></i>`).join("")}</span></span></span></span><span class="hw-w" style="left:16px;top:176px;width:136px;height:40px;--k:5"><em>SERVICE</em><span class="hw-c"><span class="hw-svc"><b>Check-up</b><small>30 min</small></span></span></span><span class="hw-w" style="left:164px;top:176px;width:136px;height:40px;--k:6"><em>SERVICE</em><span class="hw-c"><span class="hw-svc"><b>Cleaning</b><small>45 min</small></span></span></span><span class="hw-w" style="left:312px;top:176px;width:136px;height:40px;--k:7"><em>SERVICE</em><span class="hw-c"><span class="hw-svc"><b>Consult</b><small>20 min</small></span></span></span>
                  <span class="hw-toast"><i></i><span><b>New booking</b><small>Tue · 10:30 · Check-up</small></span></span>
                </div></div>
              </div>
              <div class="hw-tabs">${QV_STEPS.map(([t], i) => `<button type="button" data-hw="${i}" aria-label="Show step ${i + 1}: ${t}"><span><i></i></span>0${i + 1} ${t.toUpperCase()}</button>`).join("")}</div>
              <div class="hw-caps" aria-live="polite">${QV_STEPS.map(([t, d]) => `<p><b>${t}</b><span>${d}</span></p>`).join("")}</div>
            </div>
          </section>
        </div>
        <div class="qv-ask">
          ${kick("05", "CLIENTS ASK")}
          <div class="qv-chips" role="tablist" aria-label="Questions clients ask">${QV_ASK.map(([s], i) => `<button type="button" role="tab" aria-selected="${i === D.q}" class="${i === D.q ? "is-on" : ""}" data-qv-q="${i}">${s}</button>`).join("")}</div>
          <p class="qv-answer" aria-live="polite">${QV_ASK[D.q][1]}</p>
        </div>
      </div>`;
    deckEl.classList.toggle("is-mob", deckMob());
    D.idea = -1;
    tickIdea();
    fitHow();
    tickHow();
    scaleDeck();
  }

  // desktop: a 1280×800 page, scaled to fit and centred; phones scroll instead
  function scaleDeck() {
    const st = deckEl.querySelector(".qv-stage");
    if (!st) return;
    if (deckMob()) { st.style.transform = ""; return; }
    const k = Math.min(innerWidth / 1280, innerHeight / 800);
    st.style.transform = `translate(${(innerWidth - 1280 * k) / 2}px, ${(innerHeight - 800 * k) / 2}px) scale(${k})`;
  }

  // how it works: a brief becomes a plan, gets built block by block, then goes live with a booking.
  // Same approach as the idea card: one rAF loop, DOM touched only when a state changes.
  const HOW_MS = 4000, HOW_BRIEF = "Booking site for my clinic. Patients get a reminder the day before.";
  const HOW = { el: null, s: -1, t0: 0, n: -1, built: -1, shown: -1, toast: null, manual: false, manualStep: 3 };
  // the mock is laid out at 464px wide; rescale it whenever its frame changes width
  const howRO = new ResizeObserver((ents) => ents.forEach((en) => {
    if (en.contentRect.width) en.target.style.setProperty("--k", en.contentRect.width / 464);
  }));
  function fitHow() {
    const view = deckEl.querySelector("#qvHow .hw-view");
    if (view) howRO.observe(view);
  }
  function tickHow() {
    const el = deckEl.querySelector("#qvHow");
    if (!el) return;
    if (el !== HOW.el) Object.assign(HOW, { el, s: -1, n: -1, built: -1, shown: -1, toast: null, bars: [...el.querySelectorAll(".hw-tabs i")], blocks: [...el.querySelectorAll(".hw-w")], typed: el.querySelector(".hw-typed") });
    const auto = !prefersReducedMotion && !HOW.manual;
    const e = auto ? ((performance.now() - HOW.t0) / HOW_MS) % 4 : HOW.manualStep;
    const s = Math.floor(e), p = auto ? e - s : 1;
    if (s !== HOW.s) { HOW.s = s; el.dataset.step = s; HOW.n = -1; HOW.built = -1; HOW.shown = -1; HOW.toast = null; }
    // the brief types itself in step 1
    const n = s === 0 ? Math.floor(Math.min(1, p / 0.7) * HOW_BRIEF.length) : HOW_BRIEF.length;
    if (n !== HOW.n) { HOW.n = n; HOW.typed.textContent = HOW_BRIEF.slice(0, n); el.classList.toggle("is-typing", s === 0 && n < HOW_BRIEF.length); }
    // plan: dashed outlines appear one by one; build: each fills in; launch: all live
    const shown = s === 1 ? Math.min(8, Math.floor(p / 0.7 * 8) + 1) : s > 1 ? 8 : 0;
    const built = s === 2 ? Math.max(0, Math.min(8, Math.floor((p - 0.08) / 0.75 * 8) + 1)) : s === 3 ? 8 : 0;
    if (shown !== HOW.shown || built !== HOW.built) {
      HOW.shown = shown; HOW.built = built;
      HOW.blocks.forEach((b, k) => { b.classList.toggle("is-shown", k < shown); b.classList.toggle("is-built", k < built); });
    }
    const toast = s === 3 && p > 0.3;
    if (toast !== HOW.toast) { HOW.toast = toast; el.classList.toggle("is-booked", toast); }
    HOW.bars.forEach((b, k) => { b.style.transform = `scaleX(${k < s ? 1 : k === s ? p.toFixed(3) : 0})`; });
  }
  // the idea card types itself out, holds, then moves on
  // runs every display frame (60/90/120 Hz): the bar moves on the GPU (transform only),
  // and the DOM is touched only when a letter or a state actually changes
  const IDEA = { el: null, n: -1, out: null };
  function tickIdea() {
    if (!D.on) return;
    const el = deckEl.querySelector(".qv-idea");
    if (!el) return;
    if (el !== IDEA.el) Object.assign(IDEA, { el, n: -1, out: null, bar: el.querySelector(".qv-idea__bar"), txt: el.querySelector(".qv-idea__txt span") });
    const it = performance.now() - D.t0;
    const i = Math.floor(it / IDEA_MS) % QV_IDEAS.length, t = it % IDEA_MS;
    const [tag, full] = QV_IDEAS[i];
    const n = prefersReducedMotion ? full.length : Math.min(full.length, Math.floor((t / TYPE_MS) * full.length));
    if (i !== D.idea) {
      // the whole sentence is laid out up front (no reflow while typing); letters fade in one by one
      D.idea = i;
      IDEA.n = 0;
      el.querySelector(".qv-idea__tag").textContent = tag;
      el.querySelector(".qv-idea__num").textContent = `0${i + 1} / 0${QV_IDEAS.length}`;
      IDEA.txt.innerHTML = [...full].map((c) => `<span>${c}</span>`).join("");
      IDEA.chars = IDEA.txt.children;
      IDEA.last = null;
    }
    if (n !== IDEA.n) {
      for (let k = IDEA.n; k < n; k++) IDEA.chars[k].className = "on";
      if (IDEA.last) IDEA.last.className = "on";
      IDEA.last = n > 0 && n < full.length ? IDEA.chars[n - 1] : null; // the caret rides the newest letter
      if (IDEA.last) IDEA.last.className = "on cur";
      IDEA.n = n;
    }
    const out = !prefersReducedMotion && t > IDEA_MS - 600;
    if (out !== IDEA.out) { IDEA.out = out; el.classList.toggle("is-out", out); }
    IDEA.bar.style.transform = `scaleX(${(t / IDEA_MS).toFixed(4)})`;
  }
  let ideaRaf = 0;
  const ideaLoop = () => { tickIdea(); tickHow(); ideaRaf = D.on ? requestAnimationFrame(ideaLoop) : 0; };

  // ---- switching between the quick view and the full site
  let lastMob = deckMob();
  function showDeck() {
    if (D.on) return;
    D.on = true;
    D.t0 = performance.now();
    HOW.t0 = performance.now(); HOW.manual = false;
    if (!ideaRaf) ideaRaf = requestAnimationFrame(ideaLoop);
    lastMob = deckMob();
    renderDeck();
    deckEl.hidden = false;
    deckEl.scrollTop = 0;
    lock(true);
    requestAnimationFrame(() => requestAnimationFrame(() => deckEl.classList.add("is-on")));
  }
  function showSite(then) {
    if (!D.on) return;
    D.on = false;
    deckEl.classList.remove("is-on");
    lock(false);
    if (then) then();
    setTimeout(() => { if (!D.on) { deckEl.hidden = true; deckEl.innerHTML = ""; } }, prefersReducedMotion ? 0 : 520);
  }
  // land on the wall first, so the tile grows from where it really is
  const seeTile = (i) => { backToDeck = true; wall.scrollIntoView({ block: "center", behavior: "instant" }); openTile(i); };
  window.CS.quickView = showDeck;

  deckEl.addEventListener("input", (e) => { if (e.target.id === "qvBrief") { D.brief = e.target.value; D.briefSvc = undefined; } });
  deckEl.addEventListener("keydown", (e) => {
    if ((e.key === "Enter" || e.key === " ") && e.target.matches(".qv-idea")) { e.preventDefault(); e.target.click(); }
  });
  deckEl.addEventListener("click", (e) => {
    const hw = e.target.closest("[data-hw]");
    if (hw) {
      // jump to a step; the loop carries on from there (or holds it when motion is reduced)
      const k = +hw.dataset.hw;
      HOW.t0 = performance.now() - k * HOW_MS; HOW.manualStep = k; HOW.manual = prefersReducedMotion;
      tickHow();
      return;
    }
    const t = e.target.closest("[data-qv],[data-qv-p],[data-qv-q],[data-qv-b]");
    if (!t || !deckEl.contains(t)) return;
    const ds = t.dataset;
    if (ds.qvP) {
      const i = +ds.qvP;
      if (i === D.p) { showSite(() => seeTile(i)); return; } // second tap on the open row: see it in full
      D.p = i;
    } else if (ds.qvQ) {
      D.q = +ds.qvQ;
      deckEl.querySelectorAll(".qv-chips button").forEach((b, k) => { b.classList.toggle("is-on", k === D.q); b.setAttribute("aria-selected", String(k === D.q)); });
      deckEl.querySelector(".qv-answer").textContent = QV_ASK[D.q][1];
      return;
    } else if (ds.qvB) {
      const b = QV_BUILD[+ds.qvB];
      // the AI row shows the case study on the full site; the rest open the brief
      if (b[3]) { location.href = "build/#ai"; return; }
      else openWizard(b[2]);
      return;
    }
    else {
      const act = ds.qv;
      if (act === "site") { showSite(); return; }
      if (act === "openp") { const i = D.p; showSite(() => seeTile(i)); return; }
      if (act === "more") { showSite(() => { backToDeck = true; wall.scrollIntoView({ block: "center", behavior: "instant" }); openMore(); }); return; }
      if (act === "send") { openWizard(D.briefSvc, D.brief.trim()); return; }
      if (act === "useidea") {
        const [, full, svc] = QV_IDEAS[Math.max(0, D.idea)];
        Object.assign(D, { brief: full, briefSvc: svc });
        const ta = deckEl.querySelector("#qvBrief");
        ta.value = full;
        ta.focus();
        return;
      }
      if (act === "nextidea") {
        const it = performance.now() - D.t0;
        D.t0 -= IDEA_MS - (it % IDEA_MS);
        tickIdea();
        return;
      }
      return;
    }
    renderDeck();
  });
  addEventListener("resize", () => {
    if (!D.on) return;
    if (deckMob() !== lastMob) { lastMob = deckMob(); renderDeck(); } else scaleDeck();
  }, { passive: true });

  // ?view=quick opens straight into the quick view
  if (new URLSearchParams(location.search).get("view") === "quick") showDeck();

  // the release-edge countdown really counts down
  setInterval(() => {
    document.querySelectorAll("[data-countdown]").forEach((el) => {
      const [h, m, s] = el.textContent.split(":").map(Number);
      let t = h * 3600 + m * 60 + s - 1;
      if (t < 0) t = Number(el.dataset.countdown.split(":").reduce((a, x) => a * 60 + +x, 0));
      el.textContent = [t / 3600, (t % 3600) / 60, t % 60].map((x) => String(Math.floor(x)).padStart(2, "0")).join(":");
    });
  }, 1000);

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

  /* ==========================================================
     HERO BRIEF
     The command bar types out example briefs; chips start one
     and pick the service; sending opens the intake wizard.
     ========================================================== */
  const briefForm = document.getElementById("briefForm");
  const briefInput = document.getElementById("briefInput");
  const briefChips = [...document.querySelectorAll("#briefChips button")];
  let briefSvc;

  briefChips.forEach((chip) => {
    chip.addEventListener("click", () => {
      briefChips.forEach((c) => c.setAttribute("aria-pressed", c === chip));
      briefSvc = chip.dataset.svc;
      briefInput.value = chip.dataset.text;
      briefInput.focus();
    });
  });
  briefForm.addEventListener("submit", (e) => {
    e.preventDefault();
    if (briefMode === "explore") { if (shownHits[0]) shownHits[0].go(); return; }
    openWizard(briefSvc, briefInput.value.trim());
  });

  // ---- two doors: describe a project, or explore the work first
  const briefEl = document.querySelector(".brief");
  const briefResults = document.getElementById("briefResults");
  const modeTabs = [...document.querySelectorAll(".brief__modes [data-mode]")];
  let briefMode = "describe";
  let shownHits = [];
  const toTile = (i) => () => { wall.scrollIntoView({ block: "center", behavior: "instant" }); openTile(i); };
  const KIND = { tapfour: "Dashboard", aegis: "AI", trader: "Software", bookshop: "Online store" };
  const flag = (id) => {
    const i = WORK.findIndex((p) => p.id === id), p = WORK[i];
    return {
      t: p.name, d: p.short, kind: KIND[id], img: thumb(p.poster), go: toTile(i),
      // every feature title is searchable, so "stock" finds Tapfour
      k: [p.kind, p.oneLine, p.stack, ...p.groups.flatMap((g) => g.feats.map((f) => f.t))].join(" "),
    };
  };
  const page = (t, d, kind, img, href, k) => ({ t, d, kind, img: thumb(P + img), k, go: () => { location.href = href; } });
  const WP = page("WordPress & WooCommerce", "Create, extend and maintain: themes, stores, plugins", "WordPress", "ulap-coffee.webp", "wordpress/",
    "wordpress woocommerce theme block plugin create build extend gcash maya store shop ulap coffee");
  const HITS = [
    flag("tapfour"), flag("aegis"),
    page("AI implementation", "Try six AI assistants from real builds", "AI", "ai-dental.webp", "ai/",
      "ai chatbot chat assistant agent receptionist support clinic dental store booking demo try lead quote content"),
    WP, flag("bookshop"), flag("trader"),
    page("Monthly WordPress care", "Updates, backups, security, speed and fixes", "WordPress", "ulap-coffee.webp", "#wordpress",
      "wordpress care plan maintain maintenance monthly update updates backup security speed fix fixes hosting"),
    page("Dashboards", "Your numbers in one place", "What I build", "tapfour-dash-reports.webp", "build/#dashboards", "dashboard kpi report numbers stock branches analytics"),
    page("Automation", "Busywork that runs itself", "What I build", "shop-mail-shop-new-order.webp", "build/#automation", "automate automation workflow email follow-up n8n zapier"),
    page("Custom software", "Built around one daily job", "What I build", "tapfour-admin-board.webp", "build/#software", "app web app portal mvp platform system"),
    page("Websites & stores", "Sites and stores that sell", "What I build", "shop-hero.webp", "build/#websites", "website site store shop shopify landing seo ecommerce"),
    page("Behind the build", "How the work stays clean", "What I build", "tapfour-admin-history.webp", "build/#behind", "backend server database tests security clean code"),
  ];
  // the four shown before anyone types: what clients buy most
  const PREVIEW = HITS.slice(0, 4);
  const STOP = new Set(["a", "an", "and", "the", "for", "to", "of", "my", "our", "we", "i", "in", "on", "with", "need", "want", "is", "it"]);
  const escH = (x) => String(x).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

  function renderHits() {
    const q = briefInput.value.trim().toLowerCase();
    const words = q.split(/\s+/).filter((w) => w.length > 1 && !STOP.has(w));
    const has = (text, w) => (w.length > 3 ? text.includes(w) : new RegExp(`\\b${w.replace(/\W/g, "")}`).test(text));
    shownHits = !words.length ? PREVIEW : HITS
      .map((h) => {
        const name = h.t.toLowerCase(), hay = `${name} ${h.d} ${h.kind} ${h.k}`.toLowerCase();
        return { h, n: words.reduce((n, w) => n + (has(name, w) ? 2 : has(hay, w) ? 1 : 0), 0) };
      })
      .filter((x) => x.n > 0).sort((a, b) => b.n - a.n).slice(0, 4).map((x) => x.h);
    briefResults.innerHTML = shownHits.length
      ? shownHits.map((h, i) => `<a class="brief__hit" href="#" data-hit="${i}"><img src="${h.img}" alt="" loading="lazy" /><b>${escH(h.t)}<em>${h.kind}</em></b><span>${escH(h.d)}</span></a>`).join("")
      : `<p class="brief__none">Nothing like that yet. <button type="button" data-describe>Describe it instead →</button></p>`;
  }
  function setMode(m, focus = true) {
    briefMode = m;
    briefEl.dataset.mode = m;
    modeTabs.forEach((t) => {
      const on = t.dataset.mode === m;
      t.setAttribute("aria-selected", on);
      t.tabIndex = on ? 0 : -1;
    });
    briefInput.setAttribute("aria-label", m === "explore" ? "Search the work" : "Describe your project");
    if (m === "explore") { briefInput.placeholder = "Try dashboard, AI, WordPress…"; renderHits(); }
    if (focus) briefInput.focus();
  }
  modeTabs.forEach((t) => t.addEventListener("click", () => setMode(t.dataset.mode)));
  document.querySelector(".brief__modes").addEventListener("keydown", (e) => {
    if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;
    const next = modeTabs.find((t) => t.dataset.mode !== briefMode);
    setMode(next.dataset.mode, false);
    next.focus();
  });
  briefInput.addEventListener("input", () => { if (briefMode === "explore") renderHits(); });
  briefResults.addEventListener("click", (e) => {
    const hit = e.target.closest("[data-hit]");
    if (hit) { e.preventDefault(); shownHits[+hit.dataset.hit].go(); return; }
    // no match: the words they typed become the start of a brief
    if (e.target.closest("[data-describe]")) setMode("describe");
  });

  const IDEAS = [
    "A booking site for my salon",
    "A dashboard for my sales team",
    "Rebuild our WordPress site",
    "A client portal with payments",
    "Automate our lead follow-up",
  ];
  const heroEl = document.getElementById("hero");
  const spot = document.getElementById("heroSpot");
  const track = document.getElementById("buildsTrack");
  // the set twice, for a seamless loop
  [...track.children].forEach((li) => {
    const copy = li.cloneNode(true);
    copy.setAttribute("aria-hidden", "true");
    track.appendChild(copy);
  });
  const builds = [...track.children];

  const setSpot = (x, y) => {
    const r = heroEl.getBoundingClientRect();
    spot.style.setProperty("--mx", `${((x - r.left) / r.width) * 100}%`);
    spot.style.setProperty("--my", `${((y - r.top) / r.height) * 100}%`);
  };
  let lastTouch = -1e4;
  heroEl.addEventListener("mousemove", (e) => setSpot(e.clientX, e.clientY), { passive: true });
  heroEl.addEventListener("touchmove", (e) => {
    lastTouch = performance.now();
    setSpot(e.touches[0].clientX, e.touches[0].clientY);
  }, { passive: true });

  let paused = false;
  track.parentElement.addEventListener("mouseenter", () => (paused = true));
  track.parentElement.addEventListener("mouseleave", () => (paused = false));

  // each name brightens, and its tag fills in, as it nears the centre
  const lens = (off) => {
    const W = track.parentElement.clientWidth || 1;
    builds.forEach((el) => {
      const cx = el.offsetLeft + el.offsetWidth / 2 - off;
      const k = Math.max(0, 1 - Math.abs(cx - W / 2) / (W * 0.3));
      const e = k * k * (3 - 2 * k);
      const c = (a, b) => Math.round(a + (b - a) * e);
      el.style.color = `rgb(${c(125, 245)},${c(130, 246)},${c(140, 248)})`;
      el.firstChild.style.opacity = (0.4 + 0.6 * e).toFixed(3);
      el.firstChild.style.background = `rgba(233,180,76,${(0.16 * e).toFixed(3)})`;
    });
  };

  if (prefersReducedMotion) {
    briefInput.placeholder = IDEAS[0];
    lens(0);
  } else {
    const tw = { i: 0, c: 0, phase: "type", acc: 0 };
    const typeStep = (ms) => {
      if (briefMode !== "describe") return; // exploring keeps its own, still placeholder
      tw.acc += ms;
      const idea = IDEAS[tw.i];
      if (tw.phase === "type" && tw.acc > 55) { tw.acc = 0; if (++tw.c >= idea.length) tw.phase = "hold"; }
      else if (tw.phase === "hold" && tw.acc > 1800) { tw.acc = 0; tw.phase = "del"; }
      else if (tw.phase === "del" && tw.acc > 22) { tw.acc = 0; if (--tw.c <= 0) { tw.phase = "type"; tw.i = (tw.i + 1) % IDEAS.length; } }
      const txt = idea.slice(0, Math.max(0, tw.c)) + (tw.phase === "hold" ? "" : "|");
      if (briefInput.placeholder !== txt) briefInput.placeholder = txt;
    };

    // only animate while the hero is on screen
    let onScreen = true, raf = 0, last = 0, t = 0, mo = 0, mv = 1;
    const loop = (now) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now; t += dt;
      mv += ((paused ? 0 : 1) - mv) * Math.min(1, dt * 4);
      mo += dt * mv;
      const small = innerWidth <= 700;
      const half = (track.scrollWidth + (small ? 36 : 56)) / 2;
      const off = (mo * (small ? 26 : 38)) % half;
      track.style.transform = `translateX(${-off}px)`;
      lens(off);
      // no hover on touch screens: the spotlight drifts until a finger takes it
      if (!isFinePointer && now - lastTouch > 2500) {
        spot.style.setProperty("--mx", `${50 + Math.sin(t * 0.5) * 32}%`);
        spot.style.setProperty("--my", `${38 + Math.cos(t * 0.37) * 18}%`);
      }
      typeStep(dt * 1000);
      raf = onScreen ? requestAnimationFrame(loop) : 0;
    };
    new IntersectionObserver(([en]) => {
      onScreen = en.isIntersecting;
      if (onScreen && !raf) { last = performance.now(); raf = requestAnimationFrame(loop); }
    }).observe(heroEl);
  }

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
    modalImg.parentElement.style.setProperty("--src", bgUrl(thumb(p.image)));
    modalImg.alt = `${p.name}, ${p.type}`;
    modalName.textContent = p.name;
    modalType.textContent = p.type;
    modalDesc.textContent = p.desc;
    document.getElementById("modalFor").textContent = p.audience;
    document.getElementById("modalProves").textContent = p.proves;
    modalCategory.textContent = p.category;
    modalCounter.textContent = `${String(i + 1).padStart(2, "0")} / ${String(PROJECTS.length).padStart(2, "0")}`;
    modalTags.innerHTML = p.tags.map((t) => `<span>${t}</span>`).join("");
    const pageLink = document.getElementById("modalPage");
    pageLink.hidden = !p.page;
    if (p.page) pageLink.href = p.page;
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
    openWizard(p.service || CATEGORY_SERVICE[p.category]);
  });

  /* ==========================================================
     KEYBOARD: the project modal (the intake has its own, in site.js)
     ========================================================== */
  addEventListener("keydown", (e) => {
    if (!modal.classList.contains("is-open") || document.getElementById("wizard").classList.contains("is-open")) return;
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
