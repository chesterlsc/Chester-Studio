# OFFGRID 30 — STYLE GUIDE

> Every writer, designer, fact-checker and subagent follows this file.
> If a rule here conflicts with a habit, the rule wins.

---

## 0. The one test

**A 10-year-old and an 80-year-old must both get the page in 10 seconds.**
If they can't, the page is not done.

Assume every reader has ADHD: short, visual, scannable, self-explanatory.

---

## 1. Goal (from the brief)

- A survival encyclopedia for surviving **30 years without power**.
- Easy to read for **ages 10–80**.
- ~1,000 pages, 100+ chapters. Writing and design must be **top tier**.

---

## 2. Content rules (from the brief)

- **Facts only**, from trusted sources: WHO, CDC, Red Cross, FEMA, US Army field manuals, peer-reviewed studies, recent data.
- **No theories, no myths, no "some people say."** If you can't verify it, leave it out.
- **Only what people actually need.** No filler.
- **No repeated info across pages.** Each fact has ONE home page. Other pages link to it with a "See also" chip.
- **All references go at the end of each chapter**, not on each page.

### 2.1 Source tiers (use the highest tier available)

| Tier | Sources | Use for |
|---|---|---|
| 1 | WHO, CDC, FDA, EPA, NIH/NLM, FEMA/Ready.gov, American & IFRC Red Cross, NHS, UNICEF, Sphere Handbook | Health, water, safety numbers |
| 2 | US Army field manuals (FM 21-76, FM 4-25.11 / TC 4-02.1, FM 3-25.26), USDA, NCHFP (National Center for Home Food Preservation), university extension services, NOAA, NREL, US Forest Service, NFPA, ARRL, FCC | How-to methods, food preservation, building, radio, power |
| 3 | Peer-reviewed studies & systematic reviews (Cochrane, PubMed-indexed journals), especially recent | Herbal remedies, evidence claims |
| ✗ | Blogs, forums, prepper sites, YouTube without an org behind it, AI-generated text, Wikipedia (as a source — Commons images are fine) | **Never as a source** |

### 2.2 Fact rules
- Every number, dose, time, temperature or distance must trace to a source.
- Record source IDs in the page's front-matter (`sources: [w1, w3]`). They are **not shown on the page**; the chapter's Review page lists them.
- Give **both units**: liters + gallons, °C + °F, meters + feet, kg + lb.
- Where sources disagree, use the **safer** number and say "at least" / "at most".
- Medical pages say clearly when a pro is needed (red-flag box). No dosing of prescription drugs, no surgery how-tos.
- Herbal pages show an **evidence badge** (Strong / Moderate / Limited) and a "Who should NOT use this" box. Remedies with no good evidence are left out (or listed as "doesn't work" with the source).
- Legal topics (rainwater, hunting, salvage, radio, weapons, burial) say "**check your local law**" and give the US federal baseline only where a source exists.
- Security & defense content stays **legal, defensive, and de-escalation first**. No weapon-making, no traps meant to hurt people.

---

## 3. Writing standard

- **Short sentences.** Aim ≤ 12 words. Hard max 20.
- **Everyday words.** "Use" not "utilize". "Germs" not "pathogens" (unless explained).
- **One idea per line.**
- **Explain technical terms in plain words right where they appear**, like this: *"turbidity (how cloudy the water is)"*. Then add the term to the Glossary.
- Reading level target: **grade 4–6** (Flesch–Kincaid). Check every page.
- Talk to the reader: **"you"**. Steps start with a **verb**: "Fill", "Boil", "Tie".
- Use **digits** for numbers ("3 minutes", not "three minutes").
- Calm, direct, kind. Never scary, preachy, political or jokey. No gore.
- Inclusive: all ages, bodies, abilities, family types. Gender-neutral unless the topic is biological (e.g. periods, pregnancy).
- No brand names unless no generic exists (then name the generic first).
- Bold only the **one key word** per line, sparingly.

### 3.1 Word limits per page block

| Block | Limit |
|---|---|
| Title | ≤ 7 words |
| Why it matters | 1 line, ≤ 15 words |
| ✅ Do / ❌ Don't | 3–5 items each, ≤ 10 words per item |
| Steps | 3–8 steps, ≤ 15 words per step (+ optional tap-to-reveal detail ≤ 30 words) |
| What you need | 3–8 items, each with an alternative ("No X? Use Y.") |
| POV scenario | 50–90 words, present tense, "you" voice, ends with the right action |
| Visual caption | ≤ 15 words |
| Legend | Only symbols that appear on this page |
| Warning / red-flag box | ≤ 3 lines |

**Total prose per page: ~250 words max.** The visual carries the rest.

---

## 4. Page template (every page)

1. **Title + one-line "why it matters"**
2. **✅ Do / ❌ Don't**
3. **Step-by-step** (DIY / how to build)
4. **What you need + alternatives** if you don't have it
5. **POV scenario** (a short real-life situation)
6. **Main visual** (diagram, illustration or 3D)
7. **Legend** for any symbols

Each page holds a lot of information, but shows it **mainly through visuals**. It must **make sense on its own** (no "as we said earlier").

Page 10 of every chapter = **Review page**: recap checklist → 5-question quiz → references.

---

## 5. Design standard

- **Premium printed field guide** combined with a **modern interactive app**.
- Big clear headings, **color-coded sections**, consistent icons, generous spacing, **body text ≥ 18px**.
- Visuals: SVG diagrams, labeled illustrations, step strips, comparison charts, open-license images (Wikimedia Commons / public domain). Video links to trusted channels where helpful.
- **3D (React Three Fiber) only where it helps understanding**: shelter builds, water filters, knots, wound care, tool assembly. Users can rotate, zoom and step through. **Always include a 2D fallback.**
- Interactive: tap-to-reveal steps, checklists, before/after sliders, a short quiz at the end of each chapter.
- Accessible: high contrast, colorblind-safe palette, alt text, works on cheap phones and on low battery.

### 5.1 Visual rules
- **Color is never the only signal.** Every color cue also has a shape, icon or word (✓ vs ✕, triangle for warning).
- Diagrams: flat, bold outlines (2px+), labels **on** the drawing (no "see key A"), numbers in circles for steps.
- Label text in diagrams ≥ 14px at phone width.
- Show **scale** (a hand, a person, a ruler) whenever size matters.
- Show **wrong vs right** side by side when a mistake is common.
- Every image has **alt text** that says what it teaches, not just what it shows.
- Images: record title, author, license and source URL in `credits`. Allowed: Public Domain, CC0, CC BY, CC BY-SA.
- Video links: only official channels of Tier 1–2 organizations. Always also give the key steps in text (videos don't work offline).

---

## 6. Accessibility checklist (every page)

- [ ] Body ≥ 18px; line length ≤ 65 characters
- [ ] Contrast ≥ 7:1 for body text, ≥ 4.5:1 for everything else (light AND dark mode)
- [ ] Touch targets ≥ 48 × 48px
- [ ] All images/SVGs have alt text or `aria-label`; decorative ones are `aria-hidden`
- [ ] Works with keyboard only; visible focus ring
- [ ] Headings in order (h1 → h2 → h3)
- [ ] Interactive parts work without JavaScript (content visible by default; JS only enhances)
- [ ] 3D has a 2D fallback and never autoloads in Lite mode
- [ ] Respects `prefers-reduced-motion`
- [ ] Prints cleanly (no dark backgrounds, reveals expanded)

---

## 7. Fact-check checklist (every chapter)

- [ ] Every number/dose/time/temperature traced to a Tier 1–3 source
- [ ] No myth, no "some say", no unverified claim
- [ ] Medical & legal red flags present where needed
- [ ] No duplicate of a fact that lives on another page (link instead)
- [ ] Both units given
- [ ] Reading level checked (grade 4–6)
- [ ] References list complete, with title, org/author, year, URL, date checked
