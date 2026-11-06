// @ts-check
import { defineConfig } from "astro/config";
import { satteri } from "@astrojs/markdown-satteri";
import icon from "astro-icon";

export default defineConfig({
  site: "https://josephpellegrini.fr",
  integrations: [icon()],
  markdown: {
    // Keep the original typography: no automatic curly quotes or dashes.
    processor: satteri({ features: { smartPunctuation: false } }),
  },
});
