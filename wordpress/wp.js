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
