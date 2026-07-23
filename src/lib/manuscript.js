// The manuscript: movements flattened into one continuous run of leaves.
//
// Everything the book renders comes from here — the reader's routes, the leaf
// counter, the spine, the contents map and the turn links are all derived from
// a single pass, so they cannot disagree with each other.
//
// Growth is append/insert and nothing else. Add a plate or a story by editing
// a movement's `sequence`; add a movement by adding a directory. No page needs
// to change, and no existing URL moves, because a leaf's address is built from
// its own content rather than from its position in the run.

const movementModules = import.meta.glob("../content/movements/*/movement.json", {
  eager: true,
});

/** A URL-safe slug. Photograph basenames carry caps, dots and underscores. */
function slugify(value) {
  return String(value)
    .replace(/\.[a-z0-9]+$/i, "")
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .toLowerCase();
}

/**
 * Flatten every movement into one ordered array of leaves, and build the
 * contents map in the same pass so the two can never drift.
 *
 * A leaf is `{ type, movement, path, index, ... }` where `type` is one of
 * interleaf · frontmatter · photo · story · closing · end. Room is left for a
 * `film` leaf: add the type here and a branch in Leaf.astro — the movement
 * sequence already carries arbitrary item shapes.
 */
export function manuscript() {
  const entries = Object.entries(movementModules)
    .map(([file, mod]) => {
      const movement = mod.default || mod;
      return { slug: file.split("/").slice(-2, -1)[0], movement };
    })
    .sort((a, b) => (a.movement.order ?? 99) - (b.movement.order ?? 99));

  const leaves = [];
  const contents = [];

  for (const { slug, movement } of entries) {
    // A forthcoming movement is a promise, not a leaf. It appears in the
    // contents, dimmed and inert, and the reader never lands on it.
    if (movement.forthcoming) {
      contents.push({ movement, slug, path: null, stories: [] });
      continue;
    }

    const mv = { ...movement, slug };
    const base = `/read/${slug}`;
    const seen = new Set();

    // Every movement opens the same way: its part-title held alone, then the
    // epigraph and the words that introduce it.
    const openingPath = `${base}/`;
    leaves.push({ type: "interleaf", movement: mv, path: openingPath });

    // The opening leaf exists only when there is something on it. A movement
    // is often sequenced before its statement is written, and an empty leaf
    // would still take a number, a URL and a place in the run.
    const hasOpening = Array.isArray(movement.opening) && movement.opening.length > 0;
    if (movement.epigraph || hasOpening) {
      leaves.push({ type: "frontmatter", movement: mv, path: `${base}/opening/` });
    }

    const stories = [];
    for (const item of movement.sequence || []) {
      if (item.story) {
        if (item.forthcoming) {
          stories.push({ title: item.story, years: item.years, forthcoming: true, path: null });
          continue;
        }
        const path = `${base}/story-${slugify(item.story)}/`;
        leaves.push({ type: "story", movement: mv, story: item, path });
        stories.push({ title: item.story, years: item.years, path });
        continue;
      }

      // A sequence item is a plate or a story marker and nothing else. Caught
      // here, a typo names the movement and the item; left to the template it
      // surfaced as a stack trace inside a generated bundle.
      if (typeof item.photo !== "string" || !item.photo) {
        throw new Error(
          `[manuscript] ${slug}/movement.json: a sequence item has neither a ` +
            `"photo" nor a "story".\n  Got: ${JSON.stringify(item)}\n` +
            `  A plate is { "photo": "folder/file.jpg", "cap": "…" }\n` +
            `  A story is { "story": "Title", "years": "2025" }`,
        );
      }

      // A plate's address comes from its filename, so inserting a photograph
      // ahead of it never changes where it lives.
      let key = slugify(item.photo.split("/").pop());
      if (seen.has(key)) key = `${key}-${seen.size}`; // two files, one basename
      seen.add(key);
      leaves.push({ type: "photo", movement: mv, photo: item, path: `${base}/${key}/` });
    }

    if (Array.isArray(movement.closing) && movement.closing.length > 0) {
      leaves.push({ type: "closing", movement: mv, path: `${base}/closing/` });
    }

    contents.push({ movement: mv, slug, path: openingPath, stories });
  }

  // The present edge of the work.
  leaves.push({ type: "end", movement: null, path: "/read/end/" });

  // Index and neighbours, assigned once so no caller has to search the array.
  leaves.forEach((leaf, i) => {
    leaf.index = i;
    leaf.number = i + 1;
    leaf.prev = i > 0 ? leaves[i - 1].path : null;
    leaf.next = i < leaves.length - 1 ? leaves[i + 1].path : null;
  });

  // The counter excludes the end leaf: it is the edge of the work, not part
  // of its extent, and "78 / 78" on a page that holds no photograph reads as
  // an error rather than an ending.
  const extent = leaves.length - 1;

  return { leaves, contents, extent };
}
