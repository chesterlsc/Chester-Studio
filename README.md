# Chester Studio

Premium single-page portfolio and systems studio website for Chester Studio. Built with Next.js App Router, TypeScript, Tailwind CSS, Framer Motion, React Icons, and lucide-react.

## Getting Started

Install dependencies and run the development server:

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Structure

- `app/page.tsx` composes the single-page landing experience.
- `components/` contains the header, animated hero, sections, contact form, footer, and UI primitives.
- `lib/data.ts` stores navigation, role text, project data, service cards, system steps, tools, and links.
- `public/projects/` stores portfolio images.

## Replacing Project Images

Project cards are driven by `lib/data.ts`. To replace an image:

1. Add the new image to `public/projects/`.
2. Keep the original image colors intact.
3. Update the matching project `image` value in `lib/data.ts`.
4. Prefer landscape screenshots for cards. If using portrait app screens, the card will crop with `object-cover`.

## Checks

```bash
npm run lint
npm run build
```

The contact form is UI-only. Connect a form backend or email service before using it for production inquiries.
