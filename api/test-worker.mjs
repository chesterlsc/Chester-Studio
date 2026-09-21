// node api/test-worker.mjs — checks the relay accepts a real brief and rejects junk.
import assert from "node:assert";
import worker from "./worker.js";

const env = { RESEND_API_KEY: "test" };
const good = { name: "Ada", email: "ada@example.com", brief: "New project inquiry", service: "Website" };
const post = (body) =>
  new Request("https://api.chesterstudio.space", {
    method: "POST",
    headers: { "content-type": "application/json", origin: "https://chesterstudio.space" },
    body: JSON.stringify(body),
  });

let sentToResend;
globalThis.fetch = async (url, init) => ((sentToResend = JSON.parse(init.body)), new Response("{}"));

assert.equal((await worker.fetch(post(good), env)).status, 200);
assert.equal(sentToResend.to[0], "chestercatapia08@gmail.com");
assert.equal(sentToResend.reply_to, "ada@example.com");

for (const bad of [{ website: "spam" }, { email: "not-an-email" }, { name: "" }, { brief: "" }]) {
  assert.equal((await worker.fetch(post({ ...good, ...bad }), env)).status, 400, JSON.stringify(bad));
}

assert.equal((await worker.fetch(new Request("https://api.chesterstudio.space"), env)).status, 404);
console.log("worker ok");
