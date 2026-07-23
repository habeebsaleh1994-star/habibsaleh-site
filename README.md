# habibsaleh.com

*To Pray Is to Wander About the Meaning of Life* — Habib Saleh's continuous body of
photographic and written work, presented as a digital book, plus a separate wing for
commissioned photography.

Astro, static output, no framework. Deploys to Cloudflare Pages automatically on push to `main`.

```sh
npm install
npm run dev      # http://localhost:4321
npm run build    # → dist/
npm run preview  # serve the built site
```

Requires Node ≥ 22.12 (pinned for CI in `.node-version`).

---

## The shape of the site

The book is one continuous run of **leaves**. Movements contain plates and stories; the
reader turns through all of them in order, from the first movement to the present edge.

| | |
|---|---|
| `/` | Threshold — the title page |
| `/prelude/` | The first encounter with the voice of the work |
| `/contents/` | The map: movements, with their stories nested inside |
| `/read/…` | The reader. One page per leaf |
| `/notebook/` | The writings |
| `/colophon/` | About, contact, and the single seam to Commissions |
| `/commissions/` | The commercial wing — white, sans, deliberately another world |

**A leaf's address is built from its own content, never from its position.** A plate lives at
`/read/<movement>/<photo-basename>/`. That is what lets the book grow: inserting a photograph
in the middle does not move the URL of anything behind it, so a link shared today still lands
on the same photograph a year from now.

---

## Where things live

```
src/
  content/
    movements/<slug>/movement.json   a movement of the book
    book/book.json                   threshold, prelude, colophon, end, notebook copy
    editorial/<slug>.json            a commission
    writing/<slug>.json              a passage in the notebook
  assets/photos/<folder>/            web-sized photographs (2400px)
  lib/manuscript.js                  flattens the movements into one run of leaves
  lib/images.js                      resolves a filename to an image
  layouts/Book.astro                 every screen of the book
  layouts/Wing.astro                 the commissions wing
  components/Meta.astro              <head>: title, description, canonical, share preview
  styles/global.css                  the palette; book.css; commissions.css
public/_redirects                    301s from every address the old site published
originals/                           full-resolution originals — NOT in git
```

**Photographs go in `src/assets/photos/`, not `public/`.** That is what lets Astro resize them
and emit avif at build time. A photo in `public/` is served at full size to every visitor —
the site once shipped 4.8 MB that way.

---

## Adding to the book

1. Put the photographs in `src/assets/photos/<folder>/`.
2. Edit `src/content/movements/<slug>/movement.json`, or add a directory for a new movement.
   The directory name becomes the URL: `/read/<slug>/`.
3. `npm run build`.

```json
{
  "roman": "II",
  "title": "Before It Disappears",
  "years": "2023 — 2025",
  "order": 2,
  "epigraph": "…", "epigraphSource": "…", "epigraphNote": "…",
  "opening": ["Paragraphs on the leaf after the part-title."],
  "sequence": [
    { "photo": "before-it-disappears/01.jpg", "cap": "What is in the frame." },
    { "story": "The Season of the Mulberry", "years": "2025",
      "opening": ["Paragraphs on the leaf that announces the story."] }
  ],
  "closing": ["Paragraphs after the last plate."],
  "credit": "Optional single line, shown under the closing."
}
```

Only `roman`, `title`, `years`, `order` and `sequence` are required. Everything else renders
when present, so a movement can ship on its photographs alone and gain its words later.

`sequence` is the reading order. An item is either a **plate** (`photo` + `cap`) or a **story
marker** (`story` + `years`, optionally `opening`). A story is announced where its marker sits
and its plates simply follow — which is how a story gets discovered inside a movement after the
fact: drop a marker into an existing run.

Add `"forthcoming": true` to a movement or a story to list it in the contents, dimmed and
inert, with no leaf behind it.

**Two things nothing checks for you:**

- `roman` and `order` are separate values. Insert a movement in the middle and you must
  renumber the ones after it yourself, or the contents will read I, II, II.
- `credit` only prints on the closing leaf. A credit with no `closing` paragraphs silently
  disappears.

## Adding a passage

Add `src/content/writing/<slug>.json` with `title`, `date`, `dateSort`, `slug`, `paragraphs`.
The notebook sorts on `dateSort` (newest first).

## Adding a commission

Copy `src/content/editorial/_template.json` to `<slug>.json` and put the images in
`src/assets/photos/editorial/<slug>/`. Files starting with `_` are ignored, so renaming a story
to `_<slug>.json` unpublishes it. `order` sets its place in the grid; `category` is the line
under the title.

In `photos`, a string or `{file, alt}` is a full-width plate and a two-item array is a pair:

```json
"photos": ["01.jpg", ["02.jpg", "03.jpg"], { "file": "04.jpg", "alt": "…" }]
```

A lone portrait frame is automatically set at a narrower measure — at full width it stands taller
than most screens and swamps the plates around it.

---

## Preparing photographs

Originals stay out of the repository. Web copies are capped at 2400px on the long edge, which is
generous: the largest any photograph is displayed is 1000px, and 2400 covers that at 2× on a
retina screen.

```sh
sips -Z 2400 -s format jpeg -s formatOptions 90 <original> --out src/assets/photos/<folder>/<name>.jpg
```

Then strip identifying metadata, keeping the colour profile and the copyright:

```sh
exiftool -Make= -Model= -SerialNumber= -GPS:all= \
         -Copyright="Habib Saleh" -Artist="Habib Saleh" \
         -overwrite_original -r src/assets/photos
```

Use those tags, **not** `-all=`. A blanket strip also deletes the ICC colour profile, which
silently shifts colour on any photograph that is not already sRGB.

### Captions

Every photograph needs one. On a plate the caption is both what is printed under the
photograph and what a blind visitor receives instead of it. If a file carries an IPTC caption
written in Lightroom, lift it straight out:

```sh
exiftool -s3 -ImageDescription <file>
```

---

## Notes

- `astro.config.mjs` sets `site`; canonical URLs and absolute share-preview URLs depend on it.
- Internal links carry a trailing slash — the host 308-redirects otherwise. `public/_redirects`
  therefore lists **both** forms of every old address; the slashed one carries the real links.
- Cloudflare Pages build caching is enabled (Settings → Build → Build cache). It restores
  `node_modules/.astro`, so `cacheDir` must stay at Astro's default or the cache is lost.
- `src/pages/404.astro` builds `dist/404.html`, which Cloudflare Pages serves automatically.
- Share previews are cropped to 1200×630 JPEG. Scrapers do not decode avif, and large previews
  are dropped silently by WhatsApp and iMessage.
- The palette is solved rather than chosen; the reasoning is at the top of `global.css`. Dark
  mode falls out of it for free, which is why the book's stylesheet uses tokens and not the
  hex values in the design handoff.
