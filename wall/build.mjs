#!/usr/bin/env node
/* habibsaleh.com as a Latent Wall site: the book's content (src/content) becomes one site document, wall/site.json.
   Pictures stay where they are (src/assets/photos, already 2400 px); the document refers to them by path.
   Then, from the Wall repo:  npx tsx scripts/publish-files.mts <this repo>/wall/site.json <this repo> <out>
   and  npm run host -- habib <out>, with <this repo>/src/assets as the root of its pictures. Run: node wall/build.mjs */
import { readFileSync, writeFileSync, readdirSync, existsSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { resolve, dirname, join } from "node:path";
const root = resolve(dirname(new URL(import.meta.url).pathname), "..");
const J = (p) => JSON.parse(readFileSync(join(root, p), "utf8"));
const book = J("src/content/book/book.json"), prints = J("src/content/prints/prints.json");
const movements = readdirSync(join(root, "src/content/movements")).map((d) => J(`src/content/movements/${d}/movement.json`)).sort((a, b) => a.order - b.order);
const writings = readdirSync(join(root, "src/content/writing")).map((f) => J(`src/content/writing/${f}`)).sort((a, b) => (a.dateSort < b.dateSort ? 1 : -1));
const editorial = readdirSync(join(root, "src/content/editorial")).filter((f) => !f.startsWith("_")).map((f) => J(`src/content/editorial/${f}`)).sort((a, b) => a.order - b.order);

const slug = (s) => s.toLowerCase().normalize("NFKD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
const sizeOf = (p) => { const o = execFileSync("sips", ["-g", "pixelWidth", "-g", "pixelHeight", p]).toString(); const w = +(o.match(/pixelWidth:\s*(\d+)/) || [])[1], h = +(o.match(/pixelHeight:\s*(\d+)/) || [])[1]; if (!w || !h) throw new Error(`no size for ${p}: ${o}`); return { w, h }; };
const lib = {};
function work(rel, { title = "", date = "", caption = "", alt = "" } = {}) {
  const id = `/photos/${rel}`, file = join(root, "src/assets/photos", rel);
  if (!existsSync(file)) { console.warn("missing", rel); return null; }
  if (!lib[id]) { const { w, h } = sizeOf(file); lib[id] = { kind: "image", w, h, title: title.slice(0, 200), date, caption: caption.slice(0, 200), alt: (alt || title || caption).slice(0, 200), focal: { x: 50, y: 50 }, size: null, verso: { place: "", line: "", edition: "", made: "" } }; }
  else { if (!lib[id].title && title) lib[id].title = title.slice(0, 200); if (!lib[id].caption && caption) lib[id].caption = caption.slice(0, 200); }
  return id;
}
const yearIn = (s) => (s.match(/\b(20\d\d)\b/) || [])[1] || "";
const split = (t) => { const w = t.split(" "); if (w.length < 2) return [t, ""]; const n = w.length >= 4 ? 2 : 1; return [w.slice(0, -n).join(" "), w.slice(-n).join(" ")]; };
const pause = (text, label = "") => ({ type: "pause", label: label.slice(0, 200), text: text.slice(0, 5000) });
const piece = (asset) => ({ type: "work", asset, arrange: "alone", note: "", full: false });
const pages = [], films = [];

// the prelude
const leaves = book.prelude.leaves.flatMap((l) => l.text ? [l.text] : l.paragraphs ?? []);
pages.push({ id: "prelude", kind: "writing", title: "Prelude", titleEm: "", inNav: true, form: "Prelude", place: "", year: "", paras: leaves, margin: book.edition, image: null, appears: { title: "", description: "", share: null }, word: "" });

// the movements, each a story turned like a book
for (const m of movements) {
  const [t, em] = split(m.title), pieces = [];
  if (m.epigraph) pieces.push(pause(m.epigraph, m.epigraphSource || ""));
  if (m.opening?.length) pieces.push(pause(m.opening.join("\n\n")));
  for (const p of m.sequence) {
    if (!p.photo) {
      // a fragment of writing between the plates; a story's own opening; a film (noted, kept for a film page later)
      const text = p.fragment ? p.fragment.join("\n\n") : p.opening ? (Array.isArray(p.opening) ? p.opening.join("\n\n") : p.opening) : p.text || "";
      if (text) pieces.push(pause(text, p.story ? `${p.story}${p.years ? ", " + p.years : ""}` : ""));
      else if (p.film) films.push({ movement: m.title, ...p });
      continue;
    }
    const cap = p.cap || ""; const a = work(p.photo, { title: cap, date: yearIn(cap) || (m.years || "").slice(0, 4), alt: cap || `${m.title}, a photograph` }); if (a) pieces.push(piece(a));
  }
  if (m.closing?.length) pieces.push(pause(m.closing.join("\n\n")));
  pages.push({ id: slug(m.title), kind: "story", title: t, titleEm: em, inNav: true, kicker: `${m.roman} · ${m.years}`, note: (m.opening?.[0] || m.closing?.[0] || "").slice(0, 5000), arrangement: "book", pieces, appears: { title: "", description: "", share: null }, word: "" });
}
// the notebook
for (const w of writings) pages.push({ id: w.slug, kind: "writing", title: w.title, titleEm: "", inNav: true, form: "From the notebook", place: "", year: yearIn(w.date), paras: w.paragraphs, margin: w.date, image: null, appears: { title: "", description: "", share: null }, word: "" });
// prints: one story, series by series
{
  const pieces = [pause(`${prints.intro} ${prints.note}`)];
  for (const s of prints.series) { pieces.push(pause(`${s.title}, ${s.years}`, "Series")); for (const p of s.prints) { const a = work(p.photo, { title: p.title, date: p.year, caption: "Archival print, through Saatchi Art" }); if (a) pieces.push(piece(a)); } }
  pages.push({ id: "prints", kind: "story", title: "Prints", titleEm: "", inNav: true, kicker: "Archival prints", note: prints.intro, arrangement: "held", pieces, appears: { title: "", description: "", share: null }, word: "" });
}
// commissions, as projects
for (const e of editorial) {
  const [t, em] = split(e.title), outcome = e.photos.flat().map((p) => work(`editorial/${e.slug}/${p.file}`, { title: "", alt: p.alt || e.title, date: e.year })).filter(Boolean);
  const cover = work(`editorial/${e.slug}/${e.cover}`, { alt: e.title, date: e.year }); if (cover && !outcome.includes(cover)) outcome.unshift(cover); else if (cover) { outcome.splice(outcome.indexOf(cover), 1); outcome.unshift(cover); }
  pages.push({ id: e.slug, kind: "project", title: t, titleEm: em, inNav: true, discipline: e.category, client: e.client || "", year: e.year || "", summary: e.note || book.commissions.intro.replace(/\s*—\s*$/, "."), outcome, process: [], compare: false, facts: [], appears: { title: "", description: "", share: null }, word: "" });
}
// the films, each a page with its poster and its link
for (const f of films) {
  const poster = work(f.poster, { title: f.title, alt: f.cap || f.title }); const [t, em] = split(f.title.replace(", Part Two", " Part Two"));
  pages.push({ id: `film-${slug(f.title)}`, kind: "film", title: t, titleEm: em, inNav: true, form: "Short film", year: "2025", runtime: "", ratio: "16:9", synopsis: f.cap || "", poster, video: null, link: `https://www.youtube.com/watch?v=${f.film}`, stills: [], credits: ["A film by Habib Saleh"], appears: { title: "", description: "", share: null }, word: "" });
}
// about, contact
pages.push({ id: "about", kind: "about", title: "About", titleEm: "", inNav: true, paras: [...book.colophon.about, `${book.title} ${book.colophon.manuscriptNote}`, book.colophon.seam], principles: [], appears: { title: "", description: "", share: null }, word: "" });
pages.push({ id: "contact", kind: "contact", title: "Contact", titleEm: "", inNav: true, paras: [`Prints, commissions and enquiries: ${book.colophon.email}.`, `Instagram: ${book.colophon.instagram.handle}.`], appears: { title: "", description: "", share: null }, word: "" });

const cover = work("cover/manuscript-cover.jpg", { title: book.title, alt: "The manuscript's cover" });
const site = {
  version: 15, house: "monograph", name: "Habib Saleh", contact: `${book.colophon.email} · ${book.colophon.instagram.handle}`, email: book.colophon.email,
  front: { form: "covers", kicker: book.subtitle, title: "To pray is to wander", titleEm: "about the meaning of life", note: `Photographs, writing and film, made in Lebanon. ${book.end.line}` },
  appears: { description: `${book.title}. ${book.subtitle} Photographs and writing by Habib Saleh, made in Lebanon.`.slice(0, 200), share: cover },
  door: { word: "", soon: false, note: "" }, mark: { logo: null, icon: cover },
  theme: { look: "quiet", options: {}, palette: "silk", mode: "system", accent: null, type: "silk", mount: "bare", space: "standard", motion: "slow", read: "standard" },
  library: lib, pages, trash: [],
};
writeFileSync(join(root, "wall/site.json"), JSON.stringify(site, null, 1) + "\n");
console.log(`wall/site.json: ${Object.keys(lib).length} works, ${pages.length} pages; films noted: ${films.map((f) => f.title).join(", ") || "none"}`);
