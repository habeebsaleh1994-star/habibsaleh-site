// @ts-check
import { defineConfig } from 'astro/config';

// https://astro.build/config
export default defineConfig({
  // Required for canonical URLs and absolute og:image URLs. Without it
  // Astro.site is undefined and `new URL(path, Astro.site)` throws at build.
  site: 'https://habibsaleh.com',
});
