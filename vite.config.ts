import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

const pagesBase = process.env.VITE_BASE_PATH ?? "/pmsm-alternatives-visualizations/";

export default defineConfig({
  plugins: [react()],
  // The deployed repository can provide VITE_BASE_PATH without changing app code.
  // The repository's GitHub Pages route is the default for local and CI builds.
  base: pagesBase,
  build: {
    target: "es2022",
    cssCodeSplit: true,
  },
});
