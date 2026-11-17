# Leads for Crew

The contact relay (`worker.js`) still emails every valid brief to Chester and sends the client a receipt.
It also keeps each valid brief in a Workers KV namespace, so Crew's **Builds & Clients** tab can turn new
leads into draft clients. Drafts wait at stage *Lead* and never start on their own.

- **Stored:** only briefs that pass validation. Honeypot hits, bad emails and rate-limited requests are
  never stored. Each lead is saved under the key `lead:<ISO time>:<uuid>` and expires after a year.
- **What's saved:** `id, at, ref, name, email, service, followup, budget, timing, brief` (the client's own
  words), `notes, company, replyBy`.
- **Read:** `GET /leads` with the header `X-Leads-Key: <LEADS_KEY>` returns `{ "leads": [...] }`, newest first,
  capped at 200. A missing or wrong key gets 401. If the `LEADS` binding is missing, the route returns 404.
  The route sends no CORS headers, so no web page can read it from a browser.
- **If KV fails:** the error is logged and the email and receipt go out as before.

## One-time setup (not done yet)

Nothing below has been run. The worker has **not** been deployed.

1. Create the KV namespace:

   ```sh
   cd api
   npx wrangler kv namespace create LEADS
   ```

   It prints an `id`. Add this to `wrangler.toml`, using that id:

   ```toml
   # briefs kept for Crew's lead poller (read as env.LEADS in worker.js)
   [[kv_namespaces]]
   binding = "LEADS"
   id = "<the id wrangler printed>"
   ```

2. Pick a long random key and store it as a secret. Keep a copy for Crew:

   ```sh
   openssl rand -hex 32          # copy the output
   npx wrangler secret put LEADS_KEY   # paste it when asked
   ```

3. Test locally, then deploy:

   ```sh
   node test-worker.mjs          # prints "worker ok"
   npx wrangler deploy
   ```

4. Check it from a terminal. You should get `{"leads":[...]}`, and `401` without the header:

   ```sh
   curl -s -H "X-Leads-Key: <your key>" https://chester-studio-contact.chesterlsc.workers.dev/leads
   ```

5. In Crew, open **Builds & Clients → Settings**. Turn on lead intake, set the leads URL to
   `https://chester-studio-contact.chesterlsc.workers.dev` (Crew adds `/leads`), and paste the key.
   Crew checks on the interval set in *Poll minutes* and keeps the key only on this Mac.

To rotate the key, run `npx wrangler secret put LEADS_KEY` again and paste the new key into Crew.
