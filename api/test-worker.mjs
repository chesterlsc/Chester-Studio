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
console.log("worker ok");
