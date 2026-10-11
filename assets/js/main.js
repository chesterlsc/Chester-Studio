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
     WHAT I BUILD :: friction → fix, shown on real product screens
     ========================================================== */
  const OPS = [
    { q: "Bills and supplier dues live in a notebook.", kind: "INTERNAL TOOL", t: "A bills tracker that never forgets", b: "Late, due this week, unpaid. Tick Paid and next month’s bill books itself, and anything late waits for you on the home screen.", img: "tapfour-dash-billing.webp", url: "dashboard.tap4.ph/billing", p: 0, node: "billing" },
    { q: "We find out stock is gone when a customer asks.", kind: "DASHBOARD", t: "Stock that warns you first", b: "Tap − and + as you use it. Anything running low is flagged before the shift that needs it.", img: "tapfour-dash-stock.webp", url: "dashboard.tap4.ph/inventory", p: 0, node: "stock" },
    { q: "Leads come in, then nobody follows up.", kind: "AI AUTOMATION", t: "Leads captured, scored and drafted", b: "One order finds the businesses, scores each one 0–6 with the evidence, and drafts the outreach. A person approves every send.", img: "aegis-leados-pipeline.webp", url: "aegisleados · ops.pipeline", p: 1, node: "crm" },
    { q: "I can’t tell which branch is doing well.", kind: "DASHBOARD", t: "Every branch on one screen", b: "Taps, reviews and visits per branch, the busiest hours, and a monthly report that saves as a PDF.", img: "tapfour-dash-reports.webp", url: "dashboard.tap4.ph/reports", p: 0, node: "report" },
    { q: "My numbers live in five spreadsheets.", kind: "CUSTOM SOFTWARE", t: "One place your numbers add up", b: "Log it in one line and every chart, calendar and report updates itself. No copying between tabs.", img: "trader-journal.webp", url: "trader journal · desk", p: 2, node: "dash" },
    { q: "Our website looks fine but doesn’t sell.", kind: "WEBSITE", t: "A site built around how people buy", b: "A storefront shaped to the product, with a checkout that can’t get the price wrong and emails that go out exactly once.", img: "shop-hero.webp", url: "bookshop storefront", p: 3, node: "transfer" },
  ];
  const opsEl = document.getElementById("ops");
  if (opsEl) {
    const list = opsEl.querySelector(".ops__list");
    list.insertAdjacentHTML("beforeend", OPS.map((o, i) => `
      <button type="button" role="tab" class="ops__item" data-ops="${i}" aria-selected="false" aria-controls="opsPanel">
        <i>0${i + 1}</i><span>“${o.q}”</span><em>${o.kind}</em>
      </button>`).join(""));
    const items = [...list.querySelectorAll(".ops__item")];
    const $ = (id) => document.getElementById(id);
    const panel = $("opsPanel");
    let cur = -1, timer = null, auto = !prefersReducedMotion, inView = false;
    const show = (i) => {
      if (i === cur) return;
      cur = i;
      const o = OPS[i], p = WORK[o.p];
      items.forEach((b, k) => { b.classList.toggle("is-on", k === i); b.setAttribute("aria-selected", String(k === i)); });
      if (list.scrollWidth > list.clientWidth) list.scrollTo({ left: items[i].offsetLeft - list.offsetLeft, behavior: prefersReducedMotion ? "auto" : "smooth" });
      panel.style.setProperty("--acc", p.accent);
      panel.classList.remove("is-swap"); void panel.offsetWidth; panel.classList.add("is-swap");
      $("opsImg").src = P + o.img;
      $("opsImg").parentElement.style.setProperty("--src", bgUrl(thumb(P + o.img)));
      $("opsImg").alt = `${p.name}: ${o.t}`;
      $("opsUrl").textContent = o.url;
      $("opsKind").textContent = o.kind;
      $("opsTitle").textContent = o.t;
      $("opsBody").textContent = o.b;
      $("opsSeen").innerHTML = `${logoHTML(p)}Seen in ${p.name} <b>↗</b>`;
    };
    const tick = () => {
      clearTimeout(timer);
      if (!auto || !inView) return;
      panel.classList.remove("is-timing"); void panel.offsetWidth; panel.classList.add("is-timing");
      timer = setTimeout(() => { show((cur + 1) % OPS.length); tick(); }, 6000);
    };
    const stopAuto = () => { auto = false; clearTimeout(timer); panel.classList.remove("is-timing"); };
    items.forEach((b, i) => b.addEventListener("click", () => { stopAuto(); show(i); }));
    list.addEventListener("keydown", (e) => {
      if (e.key !== "ArrowDown" && e.key !== "ArrowUp") return;
      e.preventDefault();
      stopAuto();
      const n = (cur + (e.key === "ArrowDown" ? 1 : -1) + OPS.length) % OPS.length;
      show(n); items[n].focus();
    });
    $("opsSeen").addEventListener("click", () => { stopAuto(); openTile(OPS[cur].p, OPS[cur].node); });
    $("opsStart").addEventListener("click", () => openWizard(WORK[OPS[cur].p].service));
    new IntersectionObserver(([en]) => { inView = en.isIntersecting; tick(); }, { threshold: 0.35 }).observe(opsEl);
    show(0);
  }

  /* ==========================================================
     QUICK VIEW :: the whole studio on one calm screen ("The Brief")
     Desktop is laid out at 1280×800 and scaled to fit the window,
     so nothing is ever cut; phones get a single scrolling column.
     ========================================================== */
  const QV_POSTER = { tapfour: "tapfour-dash-home.webp", aegis: "aegis-leados-pipeline.webp", bookshop: "shop-catalog.webp" };
  const QV_BUILD = [
    ["Websites", "Sell and take bookings online", "Website"],
    ["Custom software", "Apps made for your business", "Digital Product"],
    ["Dashboards", "Your numbers, live", "Business System"],
    ["Internal tools", "Run your team in one place", "Business System"],
    ["Automation & AI", "Repeat work, done for you", "AI Automation"],
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
            <div class="qv-build">${QV_BUILD.map(([t, o], i) => `
              <button type="button" data-qv-b="${i}"><span><b>${t}</b><em>${o}</em></span><i>→</i></button>`).join("")}
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
  document.querySelectorAll("[data-quick-view]").forEach((b) => b.addEventListener("click", showDeck));

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
    } else if (ds.qvB) { openWizard(QV_BUILD[+ds.qvB][2]); return; }
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
  mobileMenu.querySelectorAll("a, button").forEach((a) => a.addEventListener("click", () => setMenu(false)));

  /* ==========================================================
     ACTIVE NAV LINK
     ========================================================== */
  const sections = ["work", "build", "system", "tools", "contact"];
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
    "WordPress Developer",
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
     SPOTLIGHT on build cards
     ========================================================== */
  document.querySelectorAll(".build-card, .hstat, .offer").forEach((card) => {
    card.addEventListener("mousemove", (e) => {
      const r = card.getBoundingClientRect();
      card.style.setProperty("--mx", `${e.clientX - r.left}px`);
      card.style.setProperty("--my", `${e.clientY - r.top}px`);
    });
  });

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

  const WIZARD_STEPS = [
    {
      key: "service",
      q: "What are we building?",
      hint: "Pick the closest fit. We refine it together later.",
      options: [
        { v: "Website", d: "Landing page or full site that converts", icon: "globe" },
        { v: "WordPress / WooCommerce", d: "Custom theme, store, plugin or a fix", icon: "cart" },
        { v: "AI Automation", d: "Workflows that run your busywork 24/7", icon: "zap" },
        { v: "Business System", d: "Dashboards, internal tools, CRM, reporting", icon: "chart" },
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
    { key: "review", q: "Your project brief.", hint: "One tap and this lands straight in my inbox.", review: true },
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
  // Cloudflare Worker in api/ that forwards the brief through Resend
  const FORM_ENDPOINT = "https://chester-studio-contact.chesterlsc.workers.dev";
  let sent = false; // false | "sending" | "ok" | "error"

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
        <input type="text" id="wzWebsite" class="wizard-hp" tabindex="-1" autocomplete="off" aria-hidden="true" />
      </div>`;
    } else if (step.review) {
      if (sent) {
        const panel = {
          sending: ["…", "Sending your brief…", "One moment."],
          ok: ["✓", "Brief received.", `It landed in my inbox — I'll reply to <b>${answers.email}</b> within one business day.`],
          error: ["!", "That didn't go through.", "Copy the brief below and email it to <b>chestercatapia08@gmail.com</b> and I'll pick it up from there."],
        }[sent];
        html = `<div class="wizard__sent">
          <div class="wizard__sent-icon">${panel[0]}</div>
          <h4>${panel[1]}</h4>
          <p>${panel[2]}</p>
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
    answers.website = document.getElementById("wzWebsite").value;
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
      nextText.textContent = sent === "sending" ? "Sending…" : "Copy brief";
      nextArrow.textContent = "⧉";
      wizardNext.disabled = sent === "sending";
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

  async function submitWizard() {
    sent = "sending";
    renderStep(1);
    try {
      const res = await fetch(FORM_ENDPOINT, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ ...answers, brief: briefText() }),
      });
      sent = res.ok ? "ok" : "error";
    } catch {
      sent = "error";
    }
    renderStep(0);
  }

  function openWizard(preService, notes) {
    sent = false;
    if (notes) answers.notes = notes;
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
