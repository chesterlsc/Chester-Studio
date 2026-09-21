// Contact-form relay: browser POSTs the intake brief here, Resend delivers it.
// Deploy:  cd api && npx wrangler deploy
// Secret:  npx wrangler secret put RESEND_API_KEY
const TO = "chestercatapia08@gmail.com";
const FROM = "Chester Studio <intake@chesterstudio.space>";
const ALLOWED = ["https://chesterstudio.space", "https://www.chesterstudio.space"];

export default {
  async fetch(req, env) {
    const origin = req.headers.get("origin") || "";
    const cors = {
      "access-control-allow-origin": ALLOWED.includes(origin) ? origin : ALLOWED[0],
      "access-control-allow-headers": "content-type",
      "access-control-allow-methods": "POST, OPTIONS",
    };
    if (req.method === "OPTIONS") return new Response(null, { headers: cors });
    if (req.method !== "POST") return new Response("Not found", { status: 404, headers: cors });

    const b = await req.json().catch(() => ({}));
    const name = String(b.name || "").trim().slice(0, 120);
    const email = String(b.email || "").trim().slice(0, 200);
    const brief = String(b.brief || "").slice(0, 8000);
    // b.website is the honeypot — a real visitor never sees the field
    if (b.website || !name || !brief || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
      return new Response("Bad request", { status: 400, headers: cors });
    }

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        authorization: `Bearer ${env.RESEND_API_KEY}`,
        "content-type": "application/json",
      },
      body: JSON.stringify({
        from: FROM,
        to: [TO],
        reply_to: email,
        subject: `Project inquiry: ${String(b.service || "New build").slice(0, 80)} · ${name}`,
        text: brief,
      }),
    });
    if (!res.ok) console.error("resend", res.status, await res.text());
    return new Response(res.ok ? "ok" : "send failed", { status: res.ok ? 200 : 502, headers: cors });
  },
};
