# Handoff: *To Pray Is to Wander About the Meaning of Life* — the digital book (first edition)

## Overview
This is the design for **Habib Saleh's website reconceived as a digital book** — not a portfolio. It presents one continuous body of photographic and written work, *To Pray Is to Wander About the Meaning of Life*, as a living manuscript that grows over time. The reader enters through a **Prelude**, consults a **Contents**, and turns through the work leaf by leaf: major **movements** (formerly "projects") contain smaller **photographic stories**, and the reading flows continuously from one movement into the next. Commercial/commissioned work lives in a separate, plainly-styled **Commissions** wing so it never intrudes on the book.

The goal of the build is **not** a finished, frozen site. It is a flexible container the artist keeps pouring real work into. Getting the architecture and the reading experience right matters more than completeness.

## About the Design Files
The files in `reference/` are a **design reference created as a single self-contained HTML/JS prototype** (a browser-run component + a small runtime, `support.js`). They show the intended look, structure, and behavior. **They are not production code to copy verbatim.**

The task is to **recreate this design in the target codebase** — the artist's existing site `habibsaleh-site`, which is an **Astro** project using content collections (one JSON file per project today, under `src/content/work/*/project.json`, with photos in `src/assets/photos/…`). Rebuild the experience using Astro's established patterns (pages, layouts, content collections, `astro:assets` `<Image>` for the photographs). Do **not** ship the prototype's runtime; reimplement its logic natively. If a given piece of state (bookmark, leaf index) is easier as a tiny island (React/Preact/vanilla) that's fine — keep it minimal.

To run the reference: open `reference/index.html` in a browser (serve the folder over http; don't open from `file://`). It uses no build step, no external fonts, and no network calls.

## Fidelity
**High-fidelity.** Colors, typography, spacing, hierarchy, motion, and interactions are final and intentional. Recreate the UI faithfully to these values. The one area that is intentionally *content-incomplete* is the photographs and writings: the reference carries a **curated subset** (4 Colored Air plates, one cover each for the smaller stories, two written passages). Real sequences will be longer — the layout must accommodate arbitrary counts.

Two distinct visual registers exist on purpose:
- **The book** (everything except Commissions): warm paper, serif, quiet, generous white space.
- **The Commissions wing**: white, sans-serif, plain and utilitarian — deliberately a different world.

## Screens / Views

The app is a single-surface router with these screens: `threshold · prelude · contents · reader · notebook · piece · colophon · commissions`. All book screens share: paper background `#fbfaf6`, serif body `Georgia, 'Times New Roman', serif`, ink `#2a2724`, and enter with a gentle rise-fade (see Interactions).

### 1. Threshold (entry / title page)
- **Purpose**: first impression; the book's cover/half-title.
- **Layout**: full-height flex column, content vertically centered, `max-width: 800px`, side padding `56px`. Small top row (wordmark left, "First edition · a living manuscript" right). Footer row (Notebook · Colophon left; © Habib Saleh right).
- **Components**:
  - Work title `<h1>`: Georgia, **52px**, line-height 1.18, letter-spacing -.015em, weight normal, color `#2a2724`, `max-width: 15ch`.
  - Subtitle: Georgia italic **18px**/1.6, `#6a6358`: "A record of light. A record of the strangeness of being alive."
  - Primary door: button "**Begin the work →**" — Georgia 22px, `#2a2724`, 1px bottom-border underline; hover `#6a6358`.
  - Conditional door: "**Continue reading**" — sans 11px, letter-spacing .18em, uppercase, `#8a8478`; **only shown when a bookmark exists** (localStorage). Resumes the reader at the saved leaf.
  - "Contents" — sans 11px uppercase `#8a8478`.
  - Footer labels: sans 10px, .18em, uppercase, `#b0a896`.

### 2. Prelude (first encounter)
- **Purpose**: the reader's first encounter with the *voice* of the work, before the Contents. Silence and space.
- **Layout**: full-height flex column, text block vertically centered, `max-width: 580px`, vertical padding `12vh`. Top row: wordmark left, label "Prelude" right (sans 10px .28em uppercase `#a89e8a`).
- **Components**:
  - Opening line: Georgia **italic 26px**/1.5, `#2a2724`, margin-bottom 60px: "This is not a collection of photographs. It is a way of looking, kept."
  - Two body paragraphs: Georgia **18px**/1.9, `#3a352e`.
  - Forward affordance (footer): button "**Contents →**" — Georgia 20px, underline border, `#2a2724`.

### 3. Contents (table of contents)
- **Purpose**: the map of the whole work. Must read like a book's contents, with movements clearly outweighing the stories nested inside them.
- **Layout**: full-height column, `max-width: 800px`, side padding `56px`, top padding `72px`. Header row (wordmark / "Contents"). Footer (Notebook · Colophon / ©).
- **Components**:
  - Work title `<h2>`: Georgia **italic 22px**/1.4, `#6a6358`, `max-width: 24ch`, margin-bottom 72px.
  - **Movement entry** (repeated): a block with `border-top: .5px solid #e6e1d6`, `padding-top: 34px`, `margin-bottom: 88px`. Inside:
    - Roman numeral: Georgia italic **15px**, letter-spacing .04em, `#a89e8a`, margin-bottom 14px.
    - Title + years row (flex, baseline, space-between): title Georgia **34px**, line-height 1.14, letter-spacing -.01em, `#2a2724`; years sans 10px .16em uppercase `#8a8478`.
    - **Stories group**: nested under a `border-left: .5px solid #e6e1d6`, `padding-left: 26px`, `margin-top: 26px`, `gap: 14px`. Each story is a row (flex, baseline, space-between): title Georgia **italic 17px**/1.5 `#3a352e`; year sans 10px .16em uppercase `#8a8478`.
  - **Forthcoming** movements and stories are dimmed and inert: title color `#cfc7b6`, meta `#b0a896`, `cursor: default`, no navigation. The reference shows movement "III … Forthcoming" as the growth placeholder.
  - Clicking a movement → its interleaf leaf in the reader. Clicking a story → its leaf in the reader (drops straight to that point in the movement).

### 4. Reader (the continuous manuscript) — the core
- **Purpose**: the reading itself. One continuous run of "leaves" spanning all movements. You turn forward/back through everything.
- **Layout**: full-height column. Top **spine** row (`max-width: 1100px`, padding `26px 56px 0`, 3-column grid): left "Contents" (sans 10px .2em uppercase `#a89e8a`); center current movement title (Georgia italic 13px `#a89e8a`); right leaf counter (sans 10px `#c3bba9`, e.g. "3 / 14"). Center **leaf body** (flex-centered, `min-height: 70vh`, padding `48px 56px`). Bottom **nav** (sticky, `#fbfaf6`): "← turn back" / "turn →" (sans 11px .18em uppercase; enabled `#5a554c`, disabled `#d4cfc3`).
- **Leaf types** (the body renders one at a time based on the current leaf):
  - **interleaf** (movement part-title, held in silence): centered, `max-width: 680px`. A `36×1px` rule `#cfc7b6` (margin auto, 32px below); roman Georgia italic 17px .08em `#a89e8a`; title `<h1>` Georgia **58px**, line-height 1.12, letter-spacing -.02em, `#2a2724`; years sans 11px .24em uppercase `#8a8478`, margin-top 30px.
  - **frontmatter** (movement opening): `max-width: 480px`. Epigraph Georgia italic **19px**/1.65 `#3a352e`; source line sans 11px .15em uppercase `#a89e8a` (prefixed "— "); then opening paragraphs Georgia **17px**/1.85 `#3a352e`.
  - **photo** (a plate): `max-width: 1000px`, centered. `<img>` `max-width:100%; max-height: calc(100vh - 300px); width/height auto`. Caption below, left-aligned, `max-width: 640px`: Georgia **14px**/1.6 `#5a554c`.
  - **story** (an inline intertitle announcing a story within the movement): centered, `max-width: 600px`. Label sans 10px .24em uppercase `#a89e8a`: "A story within {Movement Title}"; title `<h2>` Georgia **italic 38px**/1.22 `#2a2724`; year sans 11px .2em uppercase `#8a8478`.
  - **closing** (movement afterword): `max-width: 480px`. Paragraphs Georgia 17px/1.85 `#3a352e`; optional credit line Georgia italic 13px/1.6 `#8a8478` above a `.5px #d4cfc3` top rule.
  - **end** (present edge of the work): centered, `max-width: 520px`. Georgia italic 20px `#6a6358` "You have reached the present edge of the work." + Georgia 15px `#a89e8a` "The manuscript is still unfolding. More will appear here in time." + links "↑ Contents" and "Colophon".

### 5. Notebook (writings gathered — back matter)
- **Layout**: column, `max-width: 720px`, padding `72px 56px`. Header (wordmark / "Notebook"). Intro: Georgia italic 20px/1.55 `#6a6358`. List of writings, each a full-width button: date (sans 10px .2em uppercase `#8a8478`) over title (Georgia 24px/1.3 `#2a2724`), separated by `.5px #ece8df` bottom rules, gap 28px. Footer: Contents / ©.

### 6. Piece (a single writing / passage)
- **Layout**: column, `max-width: 620px`, padding `72px 32px 96px`. Header ("← Notebook" / wordmark). `<h1>` Georgia 36px/1.2 `#2a2724` with a date label above (sans 11px .2em uppercase `#8a8478`). Body paragraphs Georgia **18px**/1.85 `#2a2724`, margin-bottom 24px.

### 7. Colophon (about + the seam to commissions — back matter)
- **Layout**: column, `max-width: 560px`, padding `72px 32px`. Header (wordmark / "Colophon"). Three about paragraphs (Georgia 17px/1.8 `#3a352e`) — **use the exact About copy in the Content section below**. Then Contact (email `contact@habibsaleh.com`) and Instagram (`@habibsfoto`), each with a small sans label and a Georgia 17px underlined value. Finally the **single seam**: "Habib Saleh also photographs on commission. **Commissions →**" — the only bridge from the book to the commercial wing.

### 8. Commissions (separate wing — different register)
- **Purpose**: commercial/editorial portfolio for clients. Discoverable at its own address (intended `/commissions`). Deliberately plain so it can't be mistaken for the book.
- **Layout & style**: white bg `#ffffff`, **sans-serif throughout** (`-apple-system, 'Helvetica Neue', Helvetica, Arial, sans-serif`), ink `#111`/`#1c1c1c`. `max-width: 1200px`. Header: "Habib Saleh" (15px, 600) with "Commissions" kicker (11px .12em uppercase `#999`); right "The Work ↗" returns to the book. Intro line 15px/1.6 `#555` with mailto link. Grid `repeat(3, 1fr)`, gap `36px 28px`; each item: `aspect-ratio: 3/4` cover (`object-fit: cover`, placeholder `#f2f2f2`), then title (15px, 500, `#111`) and meta (12px `#999`). Footer: 1px `#ececec` top border, `© Habib Saleh — Commissions`.

## Interactions & Behavior
- **Navigation flow**:
  - Threshold → *Begin the work* → **Prelude**; *Continue reading* (if bookmark) → **Reader** at saved leaf; *Contents* → **Contents**.
  - Prelude → *Contents →* → **Contents**.
  - Contents → click a **movement** → Reader at that movement's interleaf; click a **story** → Reader at that story's leaf.
  - Reader → *turn →* / *← turn back* move one leaf across the whole manuscript (movements flow into each other via interleaves); *Contents* returns to the map. End leaf offers Contents / Colophon.
  - Colophon → *Commissions →* → **Commissions**; Commissions → *The Work ↗* → **Threshold**.
- **Leaf turning + keyboard**: Left/Right arrow keys turn leaves while in the reader. Turning is clamped at both ends (first leaf, end leaf); nav buttons dim when disabled.
- **Bookmark / resume**: the current leaf index is persisted to `localStorage['tp:leaf']` on every turn and jump. On load, if present (>0) the threshold shows "Continue reading". *Begin the work* always starts at the Prelude regardless.
- **Motion** (restrained, and disabled under `prefers-reduced-motion`):
  - `@keyframes om-rise { from { opacity:0; transform: translateY(12px); } to { opacity:1; transform:none; } }`
  - Each **screen** enters with `animation: om-rise .7s cubic-bezier(.2,.7,.2,1) both` (plays whenever a screen mounts).
  - The **reader leaf body** re-mounts on each leaf change (keyed by leaf index) and plays `om-rise .55s cubic-bezier(.2,.7,.2,1) both`, so every turn settles in gently.
  - A reduced-motion media query zeroes animation/transition durations.
- **Hover states**: quiet color shifts only (e.g. muted → ink) on links/buttons; underlined values darken their border. No transforms on hover.
- **Responsive**: single column throughout; the max-widths above are reading measures. On narrow screens reduce side padding (56 → 24–32) and the Commissions grid from 3 columns → 2 → 1. Type can scale down modestly but keep the movement/interleaf/story hierarchy.

## State Management
- `screen`: which view is showing (enum of the 8 above).
- `leaf`: integer index into the flattened manuscript (reader position).
- `bookmark`: last leaf index, mirrored to `localStorage['tp:leaf']`.
- `piece`: index of the writing being read in the Piece view.
- **Manifest model (the important part — keep it data-driven so the work can grow):**
  - Author data as an ordered list of **movements**. Each movement: `{ roman, title, years, epigraph?, epigraphSource?, opening?: string[], sequence: item[], closing?: string[], credit?, forthcoming? }`.
  - A **sequence item** is either a photograph `{ photo: <path>, cap }` or a story marker `{ story: <title>, years, forthcoming? }`.
  - **Flatten** movements into one ordered array of **leaves**: for each non-forthcoming movement push `interleaf`, `frontmatter`, then for each sequence item push a `photo` leaf or a `story` leaf, then `closing` (if present). After all movements push a single `end` leaf. Build the **Contents** in the same pass, recording the leaf index each movement (its interleaf) and each story jumps to.
  - **Growth = append/insert**, nothing else: add a photo or a story by inserting into `sequence`; add a movement by appending to the list; "discover" a story after the fact by dropping a `{ story }` marker into an existing run of photos. Forthcoming movements/stories render dimmed and inert.
  - In Astro: model movements as a **content collection** (a folder/entry per movement) whose frontmatter carries `roman/title/years/epigraph/…` and an **ordered `sequence`** array (photo refs + story markers). Generate the flattened leaf list at build time; the reader is one page that indexes into it. Stories are entries/markers *inside* a movement, never their own top-level route.

## Design Tokens
**Color — the book**
| Role | Hex |
|---|---|
| Paper background | `#fbfaf6` |
| Primary ink | `#2a2724` |
| Body ink (soft) | `#3a352e` |
| Muted | `#5a554c` |
| Warm muted | `#6a6358` |
| Label / secondary | `#8a8478` |
| Faint label | `#a89e8a` |
| Faint (dim) | `#b0a896` |
| Dimmer / forthcoming | `#c3bba9`, `#cfc7b6` |
| Hairline rule (contents/interleaf) | `#e6e1d6`, ornament `#cfc7b6` |
| Hairline rule (soft / footer) | `#ece8df` |
| Hairline rule (stronger) | `#d4cfc3` |

**Color — the Commissions wing**
| Role | Hex |
|---|---|
| Background | `#ffffff` |
| Ink | `#111` / `#1c1c1c` |
| Body text | `#555` |
| Muted | `#999`, `#aaa` |
| Border | `#ececec` |
| Image placeholder | `#f2f2f2` |

**Typography**
- Serif (book): `Georgia, 'Times New Roman', serif`.
- Sans (labels, UI, entire Commissions wing): `-apple-system, 'Helvetica Neue', Helvetica, Arial, sans-serif`.
- Scale (px): work title 52 (threshold) / 22 (contents h2); interleaf title 58; movement title (contents) 34; story intertitle 38; piece/notebook title 36/24; prelude opening 26; epigraph 19; body 17–18 (line-height 1.8–1.9); captions 14; labels 10–11 (uppercase, letter-spacing .15–.28em).
- Note: the design currently uses **Georgia** (system serif) deliberately — a distinctive display serif was flagged as a later decision. If the codebase has a brand serif, it may be substituted for the titles; keep body legibility and the size hierarchy.

**Spacing / layout**
- Reading measures (max-width, px): threshold 800, prelude 580, contents 800, reader body 480–1000 / spine 1100, notebook 720, piece 620, colophon 560, commissions 1200.
- Standard side padding 56px (32 on narrow screens). Section rhythm: movement blocks `margin-bottom: 88px`; interleaf/prelude use large vertical padding (silence).

**Radius / shadow / borders**
- Border radius: photographs ~1–2px (effectively square); no rounded cards.
- Shadows: none (flat, paper-like). Structure comes from hairline rules and space.
- Borders: `.5px` hairlines in the rule colors above; underline "buttons" use a 1px bottom border.

**Motion**
- Keyframes `om-rise` (translateY 12px + opacity) and `om-fade` (opacity). Screen enter `.7s`, leaf enter `.55s`, easing `cubic-bezier(.2,.7,.2,1)`, `both`. Fully disabled under `prefers-reduced-motion`.

## Content (exact copy to reuse)
- **Work title**: To Pray Is to Wander About the Meaning of Life
- **Subtitle / recurring line**: A record of light. A record of the strangeness of being alive.
- **Prelude**: opening line "This is not a collection of photographs. It is a way of looking, kept." + two paragraphs (see `reference/index.html`).
- **Colophon — About (authoritative, use verbatim):**
  > Habib Saleh is a Lebanese visual artist working across photography, film, and writing. Rather than approaching these as separate disciplines, he sees them as different ways of following the same inquiry, each capable of expressing what the others cannot.
  >
  > Working primarily in Lebanon, Saleh photographs the people and places closest to him — family, villages, cities, and the quiet rhythms of everyday life. Guided by natural light, long-term observation, and a sensitivity to the ordinary, his work explores presence, memory, time, and the fragile coexistence of beauty and devastation. Rather than centering extraordinary events, his photographs remain attentive to what continues around them: the gestures, relationships, and atmospheres through which life quietly persists.
  >
  > Writing moves alongside the images as an equal part of his practice, not as explanation but as another way of approaching what cannot be fully held by a photograph. Together, photography, film, and text form an ongoing body of work that reflects on perception, the limits of language, and the experience of being alive.
- **Movements & stories** (current draft): **I · Colored Air** (2023 — Ongoing; Ojibwe-proverb epigraph; stories: *The Season of the Mulberry* 2025, *When Roses Bloom* 2025). **II · Before It Disappears** (2023 — 2025; story: *What Light Knows About Us*, forthcoming). **III** forthcoming. Full copy (epigraphs, opening/closing paragraphs, plate captions, the two written passages) is in `reference/index.html`.
- **Contact**: contact@habibsaleh.com · Instagram @habibsfoto (book) — the artist also has @habibsaleh._ for editorial/portrait.

> **Note on the third strand:** the About names photography, **film**, and writing as one practice. The current architecture holds photographs (plates) and writing (passages/Notebook) but has **no film leaf yet**. When implementing, leave room in the leaf model for a `film` leaf type (e.g. an embedded film, or a still that opens one) so the third strand can join without restructuring.

## Assets
All photographs are the artist's own and already live in the target repo `habibsaleh-site` under `src/assets/photos/…` — use those originals via Astro's `<Image>`; do not re-optimize from the reference copies.
- Book plates used in the reference: `colored-air/HS-ColoredAir-2025-01.JPG`, `-02.JPG`, `-05.JPG`, `-07.JPG`; `season-of-the-mulberry/HS-TheSeasonOfTheMulberry-2025-01.JPG`; `when-roses-bloom/IMG_0487.JPG`; `before-it-disappears/before-it-disappears-01.jpg`.
- Commissions covers: under `editorial/<story>/…` (matilda-london, maison-makarem, portrait-of-gio, portraits-of-jana, antoine-saliba-jewelry, haya-magazine, portrait-of-elif, gabi-x-julia).
- No external fonts or icon assets — system serif/sans only.
- A runnable copy of the referenced photos is included in `reference/src/assets/photos/` so the prototype renders offline.

## Screenshots
Reference captures of each screen are in `screenshots/` (the design as it renders):
- `01-book.png` — Threshold (title page / entry)
- `02-book.png` — Prelude (first encounter)
- `03-book.png` — Contents (table of contents; movement/story hierarchy)
- `04-book.png` — Reader: movement interleaf (part-title held in silence)
- `05-book.png` — Reader: frontmatter (epigraph + opening words)
- `06-book-reader-plate.png` — Reader: a photographic plate + caption
- `07-book-colophon.png` — Colophon (about + the single seam to Commissions)
- `08-book-commissions.png` — Commissions wing (separate, plainer register)

## Files
- `reference/index.html` — the complete design reference (all screens, real content subset). Source of truth for exact copy and values.
- `reference/support.js` — the prototype's runtime (do **not** port; reimplement natively).
- `reference/src/assets/photos/…` — the photographs used by the reference.
- Target repo to implement in: `habibsaleh-site` (Astro).
