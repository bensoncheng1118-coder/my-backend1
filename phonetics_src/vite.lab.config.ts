/**
 * Build of the lab page for the Flask site: `bun run build:lab` writes it into the site's
 * static/phonetics folder, where Flask serves it at /static/phonetics/ (and /phonetics).
 */
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "node:path";

export default defineConfig({
  base: "/static/phonetics/",
  plugins: [react()],
  worker: { format: "es" },
  build: {
    target: "es2022",
    sourcemap: false,
    outDir: resolve(__dirname, "../static/phonetics"),
    emptyOutDir: true,
    rollupOptions: { input: resolve(__dirname, "voice-lab.html") },
  },
  server: { host: "127.0.0.1", port: 5319, strictPort: true, allowedHosts: true },
});
