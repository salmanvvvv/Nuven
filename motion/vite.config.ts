import { resolve } from "node:path";
import { defineConfig } from "vite";

// `vite` serves player.html (preview player with scrub).
// `vite build` bundles src/hf-entry.ts into build/nuven-motion.js, the script
// the HyperFrames compositions (index.html, vertical.html) load.
export default defineConfig({
  server: { port: 5174, host: true },
  build: {
    outDir: "build",
    emptyOutDir: true,
    lib: {
      entry: resolve(__dirname, "src/hf-entry.ts"),
      name: "NuvenMotion",
      formats: ["iife"],
      fileName: () => "nuven-motion.js",
    },
    minify: true,
    sourcemap: false,
  },
});
