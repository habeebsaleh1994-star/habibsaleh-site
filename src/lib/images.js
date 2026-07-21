// Central lookup for photos that live in src/assets/photos/.
//
// Photos moved out of public/ so Astro's build-time image pipeline can process
// them (resize + avif/webp). Assets under src/ must be *imported* to be
// processed, but our filenames come from JSON at build time — so we glob the
// whole tree once here and resolve by relative path.
const modules = import.meta.glob(
  "../assets/photos/**/*.{jpg,jpeg,png,JPG,JPEG,PNG}",
  { eager: true },
);

const PREFIX = "../assets/photos/";

const byPath = new Map(
  Object.entries(modules).map(([key, mod]) => [
    key.slice(PREFIX.length),
    mod.default ?? mod,
  ]),
);

/**
 * Resolve a photo to its ImageMetadata, e.g. photo("colored-air/HS-01.JPG").
 * Throws at build time rather than emitting a broken <img> at runtime — a
 * missing photo should fail the build loudly.
 */
export function photo(relPath) {
  const found = byPath.get(relPath);
  if (!found) {
    throw new Error(
      `[images] No photo at src/assets/photos/${relPath}\n` +
        `Known photos:\n  ${[...byPath.keys()].sort().join("\n  ")}`,
    );
  }
  return found;
}

/** True if a photo exists — for optional images like project covers. */
export function hasPhoto(relPath) {
  return byPath.has(relPath);
}
