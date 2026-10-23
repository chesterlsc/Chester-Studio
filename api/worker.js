// Contact-form relay: browser POSTs the intake brief here, Resend delivers it
// to Chester, then sends the client a short receipt. Each valid brief is also
// kept in the LEADS KV namespace so Crew can pick it up from GET /leads.
// Deploy:  cd api && npx wrangler deploy
// Secret:  npx wrangler secret put RESEND_API_KEY
// Leads:   see LEADS.md (KV binding LEADS, secret LEADS_KEY)
const TO = "chestercatapia08@gmail.com";
const FROM = "Chester Studio <intake@chesterstudio.space>";
const ALLOWED = [
  "https://chesterstudio.space",
  "https://www.chesterstudio.space",
  "http://localhost:8766", // local preview, so the real send can be tested before shipping
];

const clip = (v, n) => String(v || "").replace(/[\r\n]+/g, " ").trim().slice(0, n);
const LEAD_TTL = 60 * 60 * 24 * 365; // a year, then KV drops the lead
const LEADS_MAX = 200;

// "Detail:    Starting fresh" from the brief text the site builds (briefText in site.js)
const briefLine = (brief, label) => {
  const m = brief.match(new RegExp(`^${label}:[ \\t]*(.+)$`, "m"));
  const v = m ? m[1].trim() : "";
  return /^(not specified|not given|none)$/i.test(v) ? "" : v;
};

// The validated lead as stored for Crew. Only short picks and the client's own words.
function leadRecord(b, f) {
  const at = new Date().toISOString();
  const id = crypto.randomUUID();
  return {
    key: `lead:${at}:${id}`,
    value: {
      id, at,
      ref: f.ref,
      name: f.name,
      email: f.email,
      service: f.service,
      followup: clip(b.followup || b.follow || briefLine(f.brief, "Detail"), 120),
      budget: clip(b.budget, 60),
      timing: clip(b.timing, 40),
      brief: typeof b.words === "string" && b.words.trim() ? b.words.slice(0, 8000) : f.brief,
      notes: typeof b.notes === "string" ? b.notes.slice(0, 2000) : "",
      company: clip(b.company || briefLine(f.brief, "Company"), 120),
      replyBy: clip(b.replyBy, 60),
    },
  };
}

// Compare digests so the time taken says nothing about how much of the key matched.
async function sameSecret(a, b) {
  if (!a || !b) return false;
  const enc = new TextEncoder();
  const [x, y] = await Promise.all([a, b].map((s) => crypto.subtle.digest("SHA-256", enc.encode(s))));
  const u = new Uint8Array(x), v = new Uint8Array(y);
  let diff = 0;
  for (let i = 0; i < u.length; i++) diff |= u[i] ^ v[i];
  return diff === 0;
}

// GET /leads for Crew's poller: newest first, capped. No CORS, so no browser page can read it.
async function listLeads(req, env) {
  const json = (body, status = 200) =>
    new Response(JSON.stringify(body), {
      status,
      headers: { "content-type": "application/json", "cache-control": "no-store" },
    });
  if (req.method !== "GET") return new Response("Method not allowed", { status: 405, headers: { allow: "GET" } });
  if (!(await sameSecret(req.headers.get("x-leads-key") || "", env.LEADS_KEY || ""))) return json({ error: "unauthorized" }, 401);
  if (!env.LEADS) return json({ error: "no LEADS binding" }, 404);
  const names = [];
  let cursor;
  do {
    const page = await env.LEADS.list({ prefix: "lead:", cursor });
    for (const k of page.keys) names.push(k.name);
    cursor = page.list_complete ? undefined : page.cursor;
  } while (cursor);
  const newest = names.sort().reverse().slice(0, LEADS_MAX);
  const leads = (await Promise.all(newest.map((n) => env.LEADS.get(n, "json")))).filter(Boolean);
  return json({ leads });
}

export default {
  async fetch(req, env) {
    if (new URL(req.url).pathname === "/leads") return listLeads(req, env);
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

    // Keep the lead for Crew. Storage trouble never stops the brief from being emailed.
    if (env.LEADS) {
      try {
        const lead = leadRecord(b, { name, email, brief, ref, service });
        await env.LEADS.put(lead.key, JSON.stringify(lead.value), { expirationTtl: LEAD_TTL });
      } catch (e) {
        console.error("leads", e && e.name);
      }
    }

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
