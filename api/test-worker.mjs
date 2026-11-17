// node api/test-worker.mjs — checks the relay sends the brief and a receipt, and rejects junk.
import assert from "node:assert";
import worker from "./worker.js";

const env = { RESEND_API_KEY: "test" };
const good = { name: "Ada Lovelace", email: "ada@example.com", brief: "New project brief", service: "Website or online store", ref: "CS-1013-123", budget: "₱50,000 – ₱150,000", words: "BUY CHEAP PILLS http://spam" };
const post = (body, origin = "https://chesterstudio.space") =>
  new Request("https://api.chesterstudio.space", {
    method: "POST",
    headers: { "content-type": "application/json", origin },
    body: JSON.stringify(body),
  });

let mails = [];
globalThis.fetch = async (url, init) => (mails.push(JSON.parse(init.body)), new Response("{}"));

const res = await worker.fetch(post(good), env);
assert.equal(res.status, 200);
assert.deepEqual(await res.json(), { ok: true, receipt: true });
assert.equal(mails[0].to[0], "chestercatapia08@gmail.com");
assert.equal(mails[0].reply_to, "ada@example.com");
assert.match(mails[0].subject, /CS-1013-123/);
assert.equal(mails[1].to[0], "ada@example.com");
assert.match(mails[1].text, /^Hi Ada,/);
assert.match(mails[1].text, /₱50,000/);
assert.doesNotMatch(mails[1].text, /PILLS/, "receipt never echoes free text");

// receipt failure still reports the brief as sent
mails = [];
let n = 0;
globalThis.fetch = async () => (++n === 2 ? new Response("no", { status: 403 }) : new Response("{}"));
assert.deepEqual(await (await worker.fetch(post(good), env)).json(), { ok: true, receipt: false });

const local = await worker.fetch(post(good, "http://localhost:8766"), env);
assert.equal(local.headers.get("access-control-allow-origin"), "http://localhost:8766");

globalThis.fetch = async () => new Response("{}");
for (const bad of [{ website: "spam" }, { email: "not-an-email" }, { name: "" }, { brief: "" }]) {
  assert.equal((await worker.fetch(post({ ...good, ...bad }), env)).status, 400, JSON.stringify(bad));
}

assert.equal((await worker.fetch(new Request("https://api.chesterstudio.space"), env)).status, 404);

// ---- leads in KV (binding LEADS) and GET /leads for Crew ----

// In-memory stand-in for a Workers KV namespace: put/get/list with prefix + cursor paging.
function fakeKV({ failPut = false } = {}) {
  const store = new Map();
  const puts = [];
  return {
    store, puts,
    async put(key, value, opts) {
      if (failPut) throw new Error("KV down");
      puts.push({ key, opts });
      store.set(key, value);
    },
    async get(key, type) {
      const v = store.has(key) ? store.get(key) : null;
      return v !== null && type === "json" ? JSON.parse(v) : v;
    },
    async list({ prefix = "", cursor, limit = 1000 } = {}) {
      const names = [...store.keys()].filter((k) => k.startsWith(prefix)).sort();
      const start = cursor ? Number(cursor) : 0;
      const keys = names.slice(start, start + limit).map((name) => ({ name }));
      const done = start + limit >= names.length;
      return { keys, list_complete: done, cursor: done ? undefined : String(start + limit) };
    },
  };
}
const siteBrief = [
  "New project brief · CS-1013-123", "", "Building:  Website or online store", "Detail:    Starting fresh",
  "Budget:    ₱50,000 – ₱150,000", "Timing:    1–3 months", "", "In their words:", "A site for my bakery", "",
  "Company:   not specified",
].join("\n");
const siteLead = { ...good, brief: siteBrief, words: "A site for my bakery", timing: "1–3 months", replyBy: "Tue 3 pm" };
const mailsFor = async (e, body) => {
  const sent = [];
  globalThis.fetch = async (url, init) => (sent.push(JSON.parse(init.body)), new Response("{}"));
  const r = await worker.fetch(post(body), e);
  return { status: r.status, json: await r.json(), sent };
};

// a valid lead is stored once, with the short picks and the client's words, and expires in about a year
const kv = fakeKV();
const withKv = await mailsFor({ ...env, LEADS: kv }, siteLead);
assert.equal(withKv.status, 200);
assert.equal(kv.puts.length, 1);
assert.match(kv.puts[0].key, /^lead:\d{4}-\d\d-\d\dT[\d:.]+Z:[0-9a-f-]{36}$/);
assert.ok(kv.puts[0].opts.expirationTtl >= 360 * 86400 && kv.puts[0].opts.expirationTtl <= 366 * 86400);
const stored = JSON.parse(kv.store.get(kv.puts[0].key));
assert.equal(stored.name, "Ada Lovelace");
assert.equal(stored.email, "ada@example.com");
assert.equal(stored.service, "Website or online store");
assert.equal(stored.followup, "Starting fresh");
assert.equal(stored.budget, "₱50,000 – ₱150,000");
assert.equal(stored.timing, "1–3 months");
assert.equal(stored.brief, "A site for my bakery");
assert.equal(stored.company, "");
assert.equal(stored.ref, "CS-1013-123");
assert.ok(kv.puts[0].key.endsWith(":" + stored.id) && kv.puts[0].key.startsWith("lead:" + stored.at));

// the email path is unchanged by the KV binding: same two mails, same response
const noKv = await mailsFor(env, siteLead);
assert.deepEqual(withKv.json, noKv.json);
assert.deepEqual(withKv.sent, noKv.sent);
assert.equal(withKv.sent.length, 2);
assert.doesNotMatch(withKv.sent[1].text, /bakery|PILLS/, "receipt still never echoes free text");

// KV failure never breaks the email path
const broken = await mailsFor({ ...env, LEADS: fakeKV({ failPut: true }) }, siteLead);
assert.equal(broken.status, 200);
assert.deepEqual(broken.json, { ok: true, receipt: true });
assert.equal(broken.sent.length, 2);

// invalid briefs and the honeypot are never stored
const kv2 = fakeKV();
globalThis.fetch = async () => new Response("{}");
for (const bad of [{ website: "spam" }, { email: "not-an-email" }, { name: "" }, { brief: "" }]) {
  assert.equal((await worker.fetch(post({ ...siteLead, ...bad }), { ...env, LEADS: kv2 })).status, 400);
}
assert.equal(kv2.store.size, 0);

// GET /leads: key required, compared safely; CORS stays closed
const KEY = "lead-key-for-tests";
const lenv = { ...env, LEADS: kv, LEADS_KEY: KEY };
const getLeads = (headers = {}, e = lenv, method = "GET") =>
  worker.fetch(new Request("https://api.chesterstudio.space/leads", { method, headers: { origin: "https://chesterstudio.space", ...headers } }), e);
for (const h of [{}, { "x-leads-key": "wrong" }, { "x-leads-key": KEY + "x" }, { "x-leads-key": "" }]) {
  const r = await getLeads(h);
  assert.equal(r.status, 401, JSON.stringify(h));
  assert.equal(r.headers.get("access-control-allow-origin"), null);
}
assert.equal((await getLeads({ "x-leads-key": "" }, { ...lenv, LEADS_KEY: undefined })).status, 401, "no secret set means locked");
assert.equal((await getLeads({ "x-leads-key": KEY }, { ...env, LEADS_KEY: KEY })).status, 404, "no binding");
assert.equal((await getLeads({ "x-leads-key": KEY }, lenv, "POST")).status, 405);
assert.equal((await getLeads({ "x-leads-key": KEY }, lenv, "OPTIONS")).headers.get("access-control-allow-origin"), null);
const ok = await getLeads({ "x-leads-key": KEY });
assert.equal(ok.status, 200);
assert.equal(ok.headers.get("access-control-allow-origin"), null);
assert.equal(ok.headers.get("cache-control"), "no-store");
assert.deepEqual((await ok.json()).leads, [stored]);

// newest first, capped at 200, across KV list pages
const many = fakeKV();
for (let i = 0; i < 1205; i++) {
  const at = new Date(Date.UTC(2026, 0, 1) + i * 60000).toISOString();
  many.store.set(`lead:${at}:id${i}`, JSON.stringify({ id: `id${i}`, at }));
}
many.store.set("other:key", "{}");
const list = (await (await getLeads({ "x-leads-key": KEY }, { ...lenv, LEADS: many })).json()).leads;
assert.equal(list.length, 200);
assert.equal(list[0].id, "id1204");
assert.equal(list[199].id, "id1005");

console.log("worker ok");
