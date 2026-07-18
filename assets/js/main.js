/* ============================================================
   CHESTER STUDIO — interactions
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

  // per-project accent — pulled from each build's own artwork
  const ACCENTS = {
    "PukPok Workz": "#ff4d4d",
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

  const DESKTOP_CAP = 6;

  /* ==========================================================
     RENDER: PROJECT GRID
     ========================================================== */
  const grid = document.getElementById("workGrid");
  PROJECTS.forEach((p, i) => {
    const card = document.createElement("article");
    card.className = "project";
    card.dataset.category = p.category;
    card.dataset.index = i;
    card.setAttribute("data-reveal", "");
    card.style.setProperty("--d", `${(i % 3) * 0.08}s`);
    card.style.setProperty("--accent", p.accent);
    card.innerHTML = `
      <div class="project__media">
        <div class="project__chrome" aria-hidden="true">
          <i></i><i></i><i></i>
          <span class="project__url"><b></b>/${p.slug}</span>
        </div>
        <div class="project__shot">
          <img src="${p.image}" alt="${p.name} — ${p.type}" loading="lazy" />
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
    const im = card.querySelector("img");
    const markTall = () => {
      if (im.naturalWidth && im.naturalHeight / im.naturalWidth > 0.85) card.classList.add("is-tall");
    };
    im.complete ? markTall() : im.addEventListener("load", markTall, { once: true });
    grid.appendChild(card);
  });

  /* ==========================================================
     RENDER: TOOLS — dual marquee belt with real brand icons
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
     HERO LIVE FEED — the revenue engine, visibly working
     ========================================================== */
  const feedBody = document.getElementById("heroFeed");
  if (feedBody) {
    const FEED_ICONS = {
      lead: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M13 2 3 14h9l-1 8 10-12h-9l1-8z"/></svg>',
      ai: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M5 5l2 2M17 17l2 2M19 5l-2 2M7 17l-2 2"/></svg>',
      mail: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-10 6L2 7"/></svg>',
      book: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18M9 16l2 2 4-4"/></svg>',
      deal: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8M12 6v2m0 8v2"/></svg>',
    };
    const FEED_EVENTS = [
      { t: "lead", text: "New lead captured", tag: "Website form" },
      { t: "ai", text: "AI qualified · score 92", tag: "Auto-routed" },
      { t: "mail", text: "Follow-up sent", tag: "4s response" },
      { t: "book", text: "Call booked", tag: "Tue · 10:00 AM" },
      { t: "lead", text: "New lead captured", tag: "Google Ads" },
      { t: "ai", text: "AI qualified · score 87", tag: "Auto-routed" },
      { t: "mail", text: "SMS follow-up sent", tag: "3s response" },
      { t: "deal", text: "Deal moved to won", tag: "CRM synced" },
      { t: "lead", text: "New lead captured", tag: "Messenger" },
      { t: "book", text: "Estimate booked", tag: "Fri · 2:30 PM" },
    ];
    const leadsEl = document.getElementById("feedLeads");
    const bookedEl = document.getElementById("feedBooked");
    let feedIdx = 0, leads = 47, booked = 12;

    const pushEvent = () => {
      const e = FEED_EVENTS[feedIdx % FEED_EVENTS.length];
      feedIdx++;
      const row = document.createElement("div");
      row.className = `feed-row feed-row--${e.t}`;
      row.innerHTML = `
        <span class="feed-row__icon">${FEED_ICONS[e.t]}</span>
        <span class="feed-row__text">${e.text}<small>${e.tag}</small></span>
        <span class="feed-row__time">now</span>`;
      feedBody.prepend(row);
      [...feedBody.querySelectorAll(".feed-row__time")].forEach((el, i) => {
        if (i > 0) el.textContent = "";
      });
      while (feedBody.children.length > 5) feedBody.lastElementChild.remove();
      if (e.t === "lead") leadsEl.textContent = ++leads;
      if (e.t === "book" || e.t === "deal") bookedEl.textContent = ++booked;
    };

    for (let i = 0; i < 4; i++) pushEvent();
    leadsEl.textContent = leads;
    bookedEl.textContent = booked;
    if (!prefersReducedMotion) setInterval(pushEvent, 2600);
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
      card.addEventListener("mousemove", (e) => {
        const r = card.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width - 0.5;
        const py = (e.clientY - r.top) / r.height - 0.5;
        card.style.transform = `perspective(900px) rotateY(${px * 7}deg) rotateX(${-py * 7}deg) translateY(-4px)`;
      });
      card.addEventListener("mouseleave", () => { card.style.transform = ""; });
    });
  }

  /* ==========================================================
     SPOTLIGHT on build cards
     ========================================================== */
  document.querySelectorAll(".build-card, .project, .hstat").forEach((card) => {
    card.addEventListener("mousemove", (e) => {
      const r = card.getBoundingClientRect();
      card.style.setProperty("--mx", `${e.clientX - r.left}px`);
      card.style.setProperty("--my", `${e.clientY - r.top}px`);
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
    modalImg.alt = `${p.name} — ${p.type}`;
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
      hint: "Pick the closest fit — we refine it together later.",
      options: [
        { v: "Website", d: "Landing page or full site that converts", icon: "globe" },
        { v: "AI Automation", d: "Workflows that run your busywork 24/7", icon: "zap" },
        { v: "Business System", d: "CRM, dashboards, pipelines, reporting", icon: "chart" },
        { v: "Digital Product", d: "Web or mobile app — MVP to launch", icon: "blocks" },
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
      hint: "USD — a range is enough to scope the right solution.",
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
        { v: "ASAP — this month", d: "Fast-track it", icon: "zap" },
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
          <p>Your email app should be open with everything pre-filled — just hit send. If it didn't open, use the copy button below and email it to <b>hello@chester.studio</b>.</p>
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
      `New project inquiry — Chester Studio`,
      ``,
      `Building:  ${answers.service || "—"}`,
      `Goal:      ${answers.goal || "—"}`,
      `Budget:    ${answers.budget || "—"}`,
      `Timeline:  ${answers.timeline || "—"}`,
      ``,
      `Name:      ${answers.name || "—"}`,
      `Email:     ${answers.email || "—"}`,
      `Company:   ${answers.company || "—"}`,
      ``,
      `Notes:`,
      answers.notes || "—",
    ].join("\n");
  }

  function submitWizard() {
    const subject = `Project inquiry — ${answers.service || "New build"} · ${answers.name || ""}`;
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
