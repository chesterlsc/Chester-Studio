/* ============================================================
   CHESTER STUDIO :: /wordpress/
   Vanilla JS. Content arrays first, then behaviour.
   ============================================================ */
(() => {
  "use strict";
  document.documentElement.classList.add("js");

  // The live store boots in WordPress Playground from this blueprint.
  const DEMO = "https://playground.wordpress.net/?blueprint-url=" + encodeURIComponent("https://chesterstudio.space/wordpress/demo/blueprint.json");
  const IMG = "../public/wordpress/";
  const CHECKS = 90; // automated checks in the Transfer Pay smoke suite

  // Transfer Pay, step by step: who sees it, and what happens.
  const FLOW = [
    { who: "SHOPPER", t: "Pick how to pay", img: "tp-checkout.webp", d: "GCash, Maya and bank transfer sit inside WooCommerce’s own Checkout block.", alt: "Checkout payment options: GCash selected, with Maya and Bank transfer below" },
    { who: "SHOPPER", t: "See exactly what to send", img: "tp-howtopay.webp", d: "The amount, the account, a QR and one-tap copy, with the order number as the reference.", alt: "How to pay panel with amount, account name, number, reference, copy buttons and QR code" },
    { who: "SHOPPER", t: "Upload the receipt", img: "tp-uploaded.webp", d: "The screenshot goes to a private folder and the order moves to Proof received.", alt: "Payment proof received confirmation with the upload time and reference" },
    { who: "SHOP", t: "Verify in one click", img: "tp-admin-order-full.webp", d: "The receipt sits beside the order in wp-admin. Verify marks it paid; Reject sends the shopper the reason.", alt: "WooCommerce order screen in wp-admin with the Transfer payment box, the receipt and the Verify button" },
  ];
  const MAILS = [
    { t: "How to pay", img: "tp-email-instructions.webp", alt: "Email to the shopper with the amount, account details, QR and a link to upload the receipt" },
    { t: "Payment proof received", img: "tp-email-proof.webp", alt: "Email to the shop with the reference and the receipt attached" },
    { t: "Payment not confirmed", img: "tp-email-rejected.webp", alt: "Email to the shopper with the reason and a link to upload again" },
  ];

  // Code excerpts live in the page as <script type="text/plain" class="src">, copied verbatim
  // from the repo. A small tokenizer colours them: c comment, s string, k keyword, f variable or call.
  const TOKEN = /(\/\/[^\n]*|\/\*[\s\S]*?\*\/)|('(?:\\.|[^'\\\n])*'|"(?:\\.|[^"\\\n])*"|`(?:\\.|[^`\\])*`)|\b(public|static|function|return|if|else|elseif|new|const|import|from|get|true|false|null|isset|empty|let|this|self|export|array)\b|(\$[a-z_]+|\b[a-z_]\w*(?=\())/gi;
  const esc = (t) => t.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  const paint = (src) => {
    let out = "", last = 0;
    src.replace(TOKEN, (m, c, str, k, f, at) => {
      out += esc(src.slice(last, at)) + `<span class="${c ? "c" : str ? "s" : k ? "k" : "f"}">${esc(m)}</span>`;
      last = at + m.length;
    });
    return out + esc(src.slice(last));
  };
  const CODE = [...document.querySelectorAll("script.src")].map((n) => ({ file: n.dataset.file.split("/").pop(), path: n.dataset.file, note: n.dataset.note, src: paint(n.textContent.replace(/^\n|\n$/g, "")) }));

  // Client stores under NDA: the real storefronts, with logos, names and contact details blurred.
  // status "on call" = still the person they call; "past" = finished engagements.
  const NDA = [
    { sector: "Beauty & body care brand", where: "Australian e-commerce store", img: "beauty", acc: "#e98cb0", status: "on call" },
    { sector: "Food & beverage brand", where: "US e-commerce store", img: "food", acc: "#4aa3b8", status: "past" },
    { sector: "Home & garden store", where: "US e-commerce store", img: "goods", acc: "#4fae8a", status: "past" },
  ];
  const NDA_COPY = {
    "on call": {
      label: "On call",
      job: "selling online, direct to its customers. I’m on call for the store: when something needs updating, fixing or building, it comes to me.",
      lists: [["When needed", ["WordPress, theme and plugin updates", "Backups, security checks and fixes", "Speed and store fixes"]], ["Growth", ["New pages for products and offers", "Storefront improvements"]]],
    },
    past: {
      label: "Past work",
      job: "selling online, direct to its customers. I kept the store fast, secure and current, and worked on how it sells.",
      lists: [["What I did", ["Kept WordPress, the theme and plugins up to date", "Backups, security checks and uptime", "Speed and store fixes"]], ["Growth", ["New pages for products and offers", "Storefront improvements", "Growth work on what sells"]]],
    },
  };

  // ---- live-store buttons
  document.querySelectorAll("[data-demo]").forEach((a) => {
    a.href = DEMO;
    a.target = "_blank";
    a.rel = "noopener";
  });

  // ---- facts
  const checks = document.querySelector("[data-checks]");
  if (checks) {
    checks.textContent = CHECKS;
    checks.closest("li").hidden = !CHECKS;
  }

  // ---- Transfer Pay flow
  const flow = document.getElementById("flow");
  flow.innerHTML = FLOW.map((s) => `<li>
      <figure class="frame frame--browser"><img src="${IMG + s.img}" alt="${s.alt}" loading="lazy" /></figure>
      <b>${s.t}</b><span><i class="flow__who">${s.who}</i>${s.d}</span></li>`).join("");
  document.getElementById("mails").innerHTML = MAILS.map((m) => `<li>
      <figure class="frame frame--mail"><img src="${IMG + m.img}" alt="${m.alt}" loading="lazy" /></figure><span>${m.t}</span></li>`).join("");

  // ---- client stores (NDA)
  if (NDA.length) {
    document.getElementById("nda").hidden = false;
    document.getElementById("ndaList").innerHTML = NDA.map((n) => `<article class="case" style="--acc:${n.acc}">
        <div class="case__media" aria-hidden="true">
          <figure class="case__desk"><span class="frame__bar"><i></i><i></i><i></i><em></em></span><img src="${IMG}nda/${n.img}-desk.webp" alt="" loading="lazy" width="1400" height="972" /></figure>
          <figure class="case__phone"><img src="${IMG}nda/${n.img}-phone.webp" alt="" loading="lazy" width="600" height="1299" /></figure>
        </div>
        <div class="case__copy">
          <p class="feat__n">Case study · WordPress + WooCommerce · ${NDA_COPY[n.status].label}</p>
          <h3>${n.sector}</h3>
          <p class="case__where">${n.where}</p>
          <p class="case__job">A ${n.sector.toLowerCase()} ${NDA_COPY[n.status].job}</p>
          <div class="case__cols">${NDA_COPY[n.status].lists.map(([h, items]) => `<div><b>${h}</b><ul class="ticks">${items.map((d) => `<li>${d}</li>`).join("")}</ul></div>`).join("")}</div>
        </div>
      </article>`).join("");
  }

  // ---- code tabs
  const box = document.getElementById("codeTabs");
  if (CODE.length) {
    box.insertAdjacentHTML("afterbegin", `<div class="code__tabs" role="tablist">${CODE.map((c, i) => `<button type="button" class="code__tab" role="tab" id="ct${i}" aria-controls="cp${i}" aria-selected="${!i}" title="${c.path}">${c.file}</button>`).join("")}</div>
      ${CODE.map((c, i) => `<div class="code__panel" role="tabpanel" id="cp${i}" aria-labelledby="ct${i}"${i ? " hidden" : ""}><p class="code__note">${c.note}</p><pre><code>${c.src}</code></pre></div>`).join("")}`);
    const tabs = [...box.querySelectorAll(".code__tab")];
    const show = (i) => tabs.forEach((t, j) => {
      t.setAttribute("aria-selected", i === j);
      t.tabIndex = i === j ? 0 : -1;
      document.getElementById("cp" + j).hidden = i !== j;
    });
    tabs.forEach((t, i) => {
      t.addEventListener("click", () => show(i));
      t.addEventListener("keydown", (e) => {
        const n = e.key === "ArrowRight" ? 1 : e.key === "ArrowLeft" ? -1 : 0;
        if (n) { const j = (i + n + tabs.length) % tabs.length; show(j); tabs[j].focus(); }
      });
    });
    show(0);
  } else box.hidden = true;

  // ---- lightbox for every framed screenshot
  const lb = document.getElementById("lb");
  const lbImg = lb.querySelector("img");
  let opener = null;
  const close = () => { lb.hidden = true; if (opener) opener.focus(); };
  document.addEventListener("click", (e) => {
    const f = e.target.closest(".frame:not(.hero__art .frame)");
    if (f) {
      const img = f.querySelector("img");
      opener = f;
      lbImg.src = img.currentSrc || img.src;
      lbImg.alt = img.alt;
      lb.hidden = false;
      lb.querySelector(".lb__x").focus();
    } else if (!lb.hidden && (e.target === lb || e.target.closest(".lb__x"))) close();
  });
  document.addEventListener("keydown", (e) => { if (e.key === "Escape" && !lb.hidden) close(); });
  document.querySelectorAll(".frame:not(.hero__art .frame)").forEach((f) => { f.tabIndex = 0; f.setAttribute("role", "button"); f.setAttribute("aria-label", "View larger: " + (f.querySelector("img").alt || "screenshot")); });
  document.addEventListener("keydown", (e) => { if ((e.key === "Enter" || e.key === " ") && e.target.classList.contains("frame")) { e.preventDefault(); e.target.click(); } });

  // ---- reveal on scroll
  document.querySelectorAll(".feat, .phones, .grid3, .vs, .svc, .steps, .code").forEach((el) => el.setAttribute("data-reveal", ""));
  const io = new IntersectionObserver((ents) => ents.forEach((en) => { if (en.isIntersecting) { en.target.classList.add("is-in"); io.unobserve(en.target); } }), { threshold: 0.12 });
  document.querySelectorAll("[data-reveal]").forEach((el) => io.observe(el));

  document.getElementById("y").textContent = new Date().getFullYear();
})();
