# Chester Studio — Portfolio

Static portfolio for Chester Studio: premium websites, AI workflows, and business systems.

**Live site:** https://chesterlsc.github.io/Chester-Studio/

## Stack

Pure HTML, CSS, and vanilla JavaScript — no frameworks, no build step. GitHub Pages serves the repo as-is.

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
