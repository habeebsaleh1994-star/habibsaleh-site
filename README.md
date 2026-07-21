# habibsaleh.com

Habib Saleh — documentary photography, editorial and portrait commissions, and writing.

Astro, static output, no framework. Deploys to Cloudflare Pages automatically on push to `main`.

```sh
npm install
npm run dev      # http://localhost:4321
npm run build    # → dist/
npm run preview  # serve the built site
```

Requires Node ≥ 22.12 (pinned for CI in `.node-version`).

---

## Where things live

```
src/
  content/
    work/<slug>/project.json     a documentary project
    editorial/<slug>.json        a commissioned story
    writing/<slug>.json          an essay
  assets/photos/<slug>/          web-sized photographs (2400px)
  lib/images.js                  resolves a filename to an image
  components/Meta.astro          <head>: title, description, canonical, share preview
originals/                       full-resolution originals — NOT in git
```

**Photographs go in `src/assets/photos/`, not `public/`.** That is what lets Astro resize them
and emit avif/webp at build time. A photo in `public/` is served at full size to every visitor —
the home page once shipped 4.8 MB that way, and now ships about 91 KB.

---

## Adding a project

1. Put the photographs in `src/assets/photos/<slug>/`.
2. Create `src/content/work/<slug>/project.json`. The directory name becomes the URL.
3. `npm run build`.

The home page tile becomes a link on its own — that grid derives its link state from the same
glob that generates the routes, so a tile can never point at a page that does not exist. A
project listed on the home page with no content directory reads "Forthcoming" instead.

```json
{
  "title": "Before It Disappears",
  "year": "2023 — 2025",
  "type": "Documentary",
  "opening": ["Paragraphs shown before the photographs."],
  "closing": ["Paragraphs shown after them."],
  "credit": "Optional single line, shown last.",
  "epigraph": { "text": "…", "attribution": "…", "note": "…" },
  "photos": [{ "file": "01.jpg", "alt": "What is in the frame." }]
}
```

Only `title`, `type`, `year` and `photos` are required. Everything else renders when present, so
a project can ship on its photographs alone and gain its text later.

## Adding an editorial story

Copy `src/content/editorial/_template.json` to `<slug>.json` and put the images in
`src/assets/photos/editorial/<slug>/`. Files starting with `_` are ignored, so renaming a story
to `_<slug>.json` unpublishes it.

In `photos`, a string or `{file, alt}` is a full-width plate and a two-item array is a diptych:

```json
"photos": ["01.jpg", ["02.jpg", "03.jpg"], { "file": "04.jpg", "alt": "…" }]
```

A lone portrait frame is automatically set at a narrower measure — at full width it stands taller
than most screens and swamps the plates around it.

---

## Preparing photographs

Originals stay out of the repository. Web copies are capped at 2400px on the long edge, which is
generous: the largest any photograph is displayed is 1100px, and 2400 covers that at 2× on a
retina screen.

```sh
sips -Z 2400 -s format jpeg -s formatOptions 90 <original> --out src/assets/photos/<slug>/<name>.jpg
```

Then strip identifying metadata, keeping the colour profile and the copyright:

```sh
exiftool -Make= -Model= -SerialNumber= -GPS:all= \
         -Copyright="Habib Saleh" -Artist="Habib Saleh" \
         -overwrite_original -r src/assets/photos
```

Use those tags, **not** `-all=`. A blanket strip also deletes the ICC colour profile, which
silently shifts colour on any photograph that is not already sRGB.

### Alt text

Every photograph needs a description — it is what a blind visitor receives instead of the image,
and what a search engine reads. If a file carries an IPTC caption written in Lightroom, lift it
straight out:

```sh
exiftool -s3 -ImageDescription <file>
```

Alt text lives in the `alt` field beside each filename. Without it the page falls back to the
project title, which tells a visitor nothing about the photograph.

---

## Notes

- `astro.config.mjs` sets `site`; canonical URLs and absolute share-preview URLs depend on it.
- Internal links carry a trailing slash (`/work/`) — the host 308-redirects otherwise.
- `src/pages/404.astro` builds `dist/404.html`, which Cloudflare Pages serves automatically.
- Share previews are cropped to 1200×630 JPEG. Scrapers do not decode avif or webp, and large
  previews are dropped silently by WhatsApp and iMessage.
