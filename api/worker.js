// Contact-form relay: browser POSTs the intake brief here, Resend delivers it
// to Chester, then sends the client a short receipt.
// Deploy:  cd api && npx wrangler deploy
// Secret:  npx wrangler secret put RESEND_API_KEY
const TO = "chestercatapia08@gmail.com";
const FROM = "Chester Studio <intake@chesterstudio.space>";
const ALLOWED = [
  "https://chesterstudio.space",
  "https://www.chesterstudio.space",
  "http://localhost:8766", // local preview, so the real send can be tested before shipping
];

const clip = (v, n) => String(v || "").replace(/[\r\n]+/g, " ").trim().slice(0, n);

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

    // a few briefs a minute per address is plenty for a person, too few for a spammer
    if (env.LIMIT) {
      const { success } = await env.LIMIT.limit({ key: req.headers.get("cf-connecting-ip") || "anon" });
      if (!success) return new Response("Too many requests", { status: 429, headers: cors });
    }

    const b = await req.json().catch(() => ({}));
    const name = clip(b.name, 120);
    const email = clip(b.email, 200);
    const brief = String(b.brief || "").slice(0, 8000);
    // b.website is the honeypot — a real visitor never sees the field
    if (b.website || !name || !brief || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
      return new Response("Bad request", { status: 400, headers: cors });
    }
    const ref = clip(b.ref, 20);
    const service = clip(b.service, 80) || "New build";

    const send = (mail) =>
      fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: { authorization: `Bearer ${env.RESEND_API_KEY}`, "content-type": "application/json" },
        body: JSON.stringify({ from: FROM, ...mail }),
      });

    const res = await send({
      to: [TO],
      reply_to: email,
      subject: `Project brief${ref ? ` ${ref}` : ""}: ${service} · ${name}`,
      text: brief,
    });
    if (!res.ok) {
      console.error("resend", res.status, await res.text());
      return new Response(JSON.stringify({ ok: false }), { status: 502, headers: cors });
    }

    // The receipt repeats only the short picks, never the client's free text,
    // so the relay can't be used to mail arbitrary messages to strangers.
    const first = name.split(" ")[0];
    const lines = [
      ["Building", service],
      ["Budget", clip(b.budget, 60)],
      ["Timing", clip(b.timing, 40)],
    ].filter((l) => l[1]).map(([k, v]) => `${(k + ":").padEnd(10)}${v}`);
    const rec = await send({
      to: [email],
      reply_to: TO,
      subject: `Got your brief${ref ? ` · ${ref}` : ""}`,
      text: [
        `Hi ${first},`,
        ``,
        `Thanks for the brief. It's with me now, and I'll reply by ${clip(b.replyBy, 60) || "the next business day"} (your time) with questions or a first plan.`,
        ``,
        ...lines,
        ...(ref ? [`Reference: ${ref}`] : []),
        ``,
        `To add anything, just reply to this email. It comes straight to me.`,
        ``,
        `Chester`,
        `Chester Studio · Parañaque, Metro Manila`,
        `https://chesterstudio.space`,
      ].join("\n"),
    });
    if (!rec.ok) console.error("receipt", rec.status, await rec.text());

    return new Response(JSON.stringify({ ok: true, receipt: rec.ok }), {
      headers: { ...cors, "content-type": "application/json" },
    });
  },
};
