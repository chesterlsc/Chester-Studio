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
      name: "Aegis Systems",
      type: "Operational Clarity Platform",
      category: "AI Systems",
      image: "public/projects/aegis-systems.png",
      desc: "An operational clarity platform that turns scattered business data into a single source of truth — dashboards, alerts, and AI-assisted decisions in one place.",
      tags: ["AI", "Dashboards", "Automation", "Next.js"],
    },
    {
      name: "GarageAI",
      type: "AI Vehicle Diagnostics",
      category: "AI Systems",
      image: "public/projects/garage-ai.png",
      desc: "AI-powered vehicle diagnostics that helps garages triage issues faster — symptoms in, ranked causes and repair guidance out.",
      tags: ["AI", "Diagnostics", "Product"],
    },
    {
      name: "FixIt App",
      type: "On Demand Service Platform",
      category: "Digital Products",
      image: "public/projects/fixit-app-mockup.png",
      desc: "An on-demand home service platform connecting customers with vetted repair pros — booking, tracking, and payments end to end.",
      tags: ["Mobile", "Marketplace", "UX"],
    },
    {
      name: "FixIt Website",
      type: "Repair Service Landing Page",
      category: "Websites",
      image: "public/projects/fixit.png",
      desc: "A high-converting landing page for the FixIt platform — clear value proposition, social proof, and a frictionless path to booking.",
      tags: ["Landing Page", "Conversion", "SEO"],
    },
    {
      name: "Mall Maps",
      type: "Mall Navigation App",
      category: "Digital Products",
      image: "public/projects/mall-maps-app-mockup.png",
      desc: "Indoor navigation for malls — searchable directories, turn-by-turn wayfinding, and store promos in a clean mobile experience.",
      tags: ["Mobile", "Maps", "Product"],
    },
    {
      name: "Mall Maps Website",
      type: "Navigation App Landing Page",
      category: "Websites",
      image: "public/projects/mall-maps.png",
      desc: "The marketing site for Mall Maps — communicating the product story and driving app installs with a bold, visual layout.",
      tags: ["Landing Page", "Branding"],
    },
    {
      name: "Greenfield Accounting",
      type: "Accounting Firm Website",
      category: "Websites",
      image: "public/projects/greenfield-accounting.png",
      desc: "A trust-first website for an accounting firm — services, credentials, and lead capture designed to convert serious clients.",
      tags: ["Corporate", "Lead Gen", "SEO"],
    },
    {
      name: "LTO Site Improvement",
      type: "Government Service Redesign",
      category: "Websites",
      image: "public/projects/lto-govt-site-improvement.png",
      desc: "A redesign concept for a government service portal — cutting through bureaucratic UX so citizens find what they need in seconds.",
      tags: ["UX Redesign", "Accessibility", "Gov"],
    },
    {
      name: "Reign Models Manila",
      type: "Modeling Agency Website",
      category: "Growth Work",
      image: "public/projects/modeling-agency.png",
      desc: "A striking portfolio site for a Manila modeling agency — editorial visuals paired with a booking funnel that grows the roster.",
      tags: ["Branding", "Growth", "Portfolio"],
    },
    {
      name: "NAMI Studio",
      type: "Creative Studio Website",
      category: "Websites",
      image: "public/projects/nami-studio.png",
      desc: "A creative studio website with personality — motion, typography, and a portfolio grid that lets the work speak.",
      tags: ["Creative", "Motion", "Portfolio"],
    },
    {
      name: "Parea Collective",
      type: "Operating Layer Website",
      category: "Growth Work",
      image: "public/projects/parea.png",
      desc: "The operating layer for a business collective — positioning, systems story, and growth infrastructure in one coherent site.",
      tags: ["Growth", "Systems", "Positioning"],
    },
    {
      name: "Parea Systems",
      type: "Business Ecosystem Website",
      category: "Growth Work",
      image: "public/projects/parea-v2.png",
      desc: "Second-generation Parea — an ecosystem site mapping every service and system into a clear client journey.",
      tags: ["Growth", "Ecosystem", "Web"],
    },
    {
      name: "PetMates Platform",
      type: "Pet Matching Product",
      category: "Digital Products",
      image: "public/projects/petmates-v1.png",
      desc: "A pet matching product connecting owners for playdates, breeding, and adoption — profiles, matching, and chat built in.",
      tags: ["Product", "Matching", "Community"],
    },
    {
      name: "PetMates Website",
      type: "Pet Social App Website",
      category: "Websites",
      image: "public/projects/petmates-v2.png",
      desc: "The public face of PetMates — playful branding and a clear story that turns visitors into early adopters.",
      tags: ["Landing Page", "Branding"],
    },
  ];

  const TOOLS = [
    { name: "n8n", color: "#EA4B71", short: "n8n" },
    { name: "VS Code", color: "#007ACC", short: "VS" },
    { name: "PostgreSQL", color: "#4a7fe8", short: "PG" },
    { name: "MongoDB", color: "#47A248", short: "M" },
    { name: "React", color: "#61DAFB", short: "Re" },
    { name: "JavaScript", color: "#F7DF1E", short: "JS" },
    { name: "Python", color: "#5c9fd6", short: "Py" },
    { name: "Zapier", color: "#FF4F00", short: "Z" },
    { name: "Railway", color: "#c9ccd4", short: "Rw" },
    { name: "Supabase", color: "#3ECF8E", short: "Sb" },
    { name: "OpenAI", color: "#10A37F", short: "AI" },
    { name: "Claude", color: "#D97757", short: "CL" },
    { name: "Codex", color: "#c9ccd4", short: "Cx" },
    { name: "Figma", color: "#F24E1E", short: "F" },
    { name: "Meta Ads", color: "#3b82f6", short: "M" },
    { name: "Amazon", color: "#FF9900", short: "A" },
    { name: "REST APIs", color: "#8B5CF6", short: "API" },
    { name: "Next.js", color: "#c9ccd4", short: "N" },
    { name: "Tailwind CSS", color: "#38BDF8", short: "TW" },
    { name: "GitHub", color: "#c9ccd4", short: "GH" },
    { name: "Vercel", color: "#c9ccd4", short: "▲" },
  ];

  const CAT_CLASS = {
    "AI Systems": "project__cat--ai",
    "Growth Work": "project__cat--growth",
  };

  /* ==========================================================
     RENDER: PROJECT GRID
     ========================================================== */
  const grid = document.getElementById("workGrid");
  PROJECTS.forEach((p, i) => {
    const card = document.createElement("article");
    card.className = "project";
    card.dataset.category = p.category;
    card.dataset.index = i;
    card.dataset.cursor = "view";
    card.setAttribute("data-reveal", "");
    card.style.setProperty("--d", `${(i % 3) * 0.08}s`);
    card.innerHTML = `
      <div class="project__media">
        <span class="project__cat ${CAT_CLASS[p.category] || ""}">${p.category}</span>
        <img src="${p.image}" alt="${p.name} — ${p.type}" loading="lazy" />
      </div>
      <div class="project__body">
        <div>
          <h3 class="project__name">${p.name}</h3>
          <p class="project__type">${p.type}</p>
        </div>
        <span class="project__arrow" aria-hidden="true">↗</span>
      </div>`;
    card.addEventListener("click", () => openModal(i));
    grid.appendChild(card);
  });

  /* ==========================================================
     RENDER: TOOLS
     ========================================================== */
  const toolsGrid = document.getElementById("toolsGrid");
  TOOLS.forEach((t, i) => {
    const el = document.createElement("div");
    el.className = "tool";
    el.style.setProperty("--tool", t.color);
    el.style.transitionDelay = `${(i % 7) * 0.05}s`;
    el.innerHTML = `<span class="tool__mark">${t.short}</span>${t.name}`;
    toolsGrid.appendChild(el);
  });

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
     HERO STAT COUNTERS
     ========================================================== */
  function startCounters() {
    document.querySelectorAll("[data-count]").forEach((el) => {
      const target = parseInt(el.dataset.count, 10);
      const duration = 1400;
      const start = performance.now();
      const step = (now) => {
        const t = Math.min(1, (now - start) / duration);
        const eased = 1 - Math.pow(1 - t, 3);
        el.textContent = Math.round(eased * target);
        if (t < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    });
  }

  /* ==========================================================
     CUSTOM CURSOR
     ========================================================== */
  if (isFinePointer && !prefersReducedMotion) {
    document.body.classList.add("has-cursor");
    const cursor = document.getElementById("cursor");
    const dot = document.getElementById("cursorDot");
    const ring = document.getElementById("cursorRing");
    const label = document.getElementById("cursorLabel");

    let mx = innerWidth / 2, my = innerHeight / 2;
    let rx = mx, ry = my;

    addEventListener("mousemove", (e) => { mx = e.clientX; my = e.clientY; });
    addEventListener("mousedown", () => cursor.classList.add("is-down"));
    addEventListener("mouseup", () => cursor.classList.remove("is-down"));

    const loop = () => {
      rx += (mx - rx) * 0.16;
      ry += (my - ry) * 0.16;
      dot.style.transform = `translate(${mx}px, ${my}px)`;
      ring.style.transform = `translate(${rx}px, ${ry}px) ${cursor.classList.contains("is-down") ? "scale(0.85)" : ""}`;
      requestAnimationFrame(loop);
    };
    loop();

    // Hover states (delegated, works for injected cards)
    document.addEventListener("mouseover", (e) => {
      const view = e.target.closest("[data-cursor='view']");
      const interactive = e.target.closest("a, button, .filter, .tool");
      cursor.classList.toggle("is-view", !!view);
      cursor.classList.toggle("is-hover", !!interactive && !view);
      if (view) label.textContent = "View";
    });
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
  const sections = ["work", "build", "system", "tools", "contact"];
  const navLinks = document.querySelectorAll(".nav__link");
  const sectionObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      navLinks.forEach((l) => l.classList.toggle("is-active", l.getAttribute("href") === `#${entry.target.id}`));
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

  document.querySelectorAll("[data-reveal], .tool").forEach((el) => revealObserver.observe(el));

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
    "Digital Systems Builder",
    "Ecommerce Operator",
    "Media Buyer",
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
     HERO PARALLAX (orbs + orbit chips)
     ========================================================== */
  if (isFinePointer && !prefersReducedMotion) {
    const parallaxEls = document.querySelectorAll("[data-parallax]");
    let pmx = 0, pmy = 0, cx = 0, cy = 0;
    addEventListener("mousemove", (e) => {
      pmx = (e.clientX / innerWidth - 0.5) * 2;
      pmy = (e.clientY / innerHeight - 0.5) * 2;
    });
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
  document.querySelectorAll(".build-card").forEach((card) => {
    card.addEventListener("mousemove", (e) => {
      const r = card.getBoundingClientRect();
      card.style.setProperty("--mx", `${e.clientX - r.left}px`);
      card.style.setProperty("--my", `${e.clientY - r.top}px`);
    });
  });

  /* ==========================================================
     FILTERS
     ========================================================== */
  const filters = document.querySelectorAll(".filter");
  filters.forEach((btn) => {
    btn.addEventListener("click", () => {
      filters.forEach((f) => f.classList.remove("is-active"));
      btn.classList.add("is-active");
      const cat = btn.dataset.filter;
      let shown = 0;
      grid.querySelectorAll(".project").forEach((card) => {
        const match = cat === "All" || card.dataset.category === cat;
        card.classList.remove("is-entering");
        if (match) {
          card.classList.remove("is-filtered");
          // restart the entrance animation, staggered
          void card.offsetWidth;
          card.style.animationDelay = `${shown * 0.06}s`;
          card.classList.add("is-entering");
          shown++;
        } else {
          card.classList.add("is-filtered");
        }
      });
    });
  });

  /* ==========================================================
     MODAL
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
    modalImg.src = p.image;
    modalImg.alt = `${p.name} — ${p.type}`;
    modalName.textContent = p.name;
    modalType.textContent = p.type;
    modalDesc.textContent = p.desc;
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
  addEventListener("keydown", (e) => {
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
