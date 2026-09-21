# Chester Studio Portfolio

Static portfolio for Chester Studio: premium websites, AI workflows, and business systems.

**Live site:** https://chesterlsc.github.io/Chester-Studio/

## Stack

Pure HTML, CSS, and vanilla JavaScript with no frameworks and no build step. GitHub Pages serves the repo as-is.

```
index.html           → the whole page
assets/css/style.css → design system + animations
assets/js/main.js    → cursor, preloader, filters, modal, scroll effects
public/              → project screenshots and logos
```

## Run locally

Open `index.html` in a browser, or:

```bash
python3 -m http.server 8000
# → http://localhost:8000
```

## Editing content

Projects and tools are plain data arrays at the top of `assets/js/main.js`. Add an image to `public/projects/`, add an entry to the `PROJECTS` array, done.

## Contact form

The intake wizard POSTs the brief to a Cloudflare Worker in `api/`, which sends it
through Resend to chestercatapia08@gmail.com (with the visitor's address as reply-to).

```bash
cd api
npx wrangler secret put RESEND_API_KEY   # key from resend.com/api-keys
npx wrangler deploy                      # serves https://api.chesterstudio.space
node test-worker.mjs                     # validation self-check
```

Verify `chesterstudio.space` in Resend first, or the `intake@chesterstudio.space`
sender in `api/worker.js` will be rejected. The endpoint the site calls is
`FORM_ENDPOINT` at the top of the wizard block in `assets/js/main.js`.
