# Chester Studio

The studio site for Chester Studio: websites, online stores, workflow automation and business systems for growing businesses.

**Live:** [chesterstudio.space](https://chesterstudio.space)

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

Content lives in plain data arrays in `assets/js/main.js`:

- `WORK`: the four flagships on the Selected Work wall. Each feature sits in a group (customer, owner, behind it) and carries a `v` visual; `shot` crops a real screenshot from `public/projects/`.
- `PROJECTS`: every other build, shown in the “+15 more builds” index and the project modal.
- `OPS`: the friction → fix examples in What I Build, each pointing at a flagship feature.
- `TOOLS`: the tool belt.

## Adding images

Images in `public/projects/` are WebP (a few photo-heavy shots stay JPG), and every one needs a 640px twin in `public/projects/thumb/`. Small frames and the blurred backdrops load the twin; only large views load the full file.

```bash
cwebp -q 88 -sharp_yuv -m 6 shot.png -o public/projects/shot.webp
cwebp -q 80 -sharp_yuv -m 6 -resize 640 0 shot.png -o public/projects/thumb/shot.webp
```

`public/projects/aegis-leados.jpg` stays a JPG: it is the social share image in `index.html`.

## Contact form

The intake wizard POSTs the brief to a Cloudflare Worker in `api/`, which sends it
through Resend to the studio inbox (with the visitor's address as reply-to).

```bash
cd api
npx wrangler secret put RESEND_API_KEY   # key from resend.com/api-keys
npx wrangler deploy                      # serves https://api.chesterstudio.space
node test-worker.mjs                     # validation self-check
```

Verify `chesterstudio.space` in Resend first, or the `intake@chesterstudio.space`
sender in `api/worker.js` will be rejected. The endpoint the site calls is
`FORM_ENDPOINT` at the top of the wizard block in `assets/js/main.js`.
