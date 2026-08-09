import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

const pagesBase = process.env.VITE_BASE_PATH ?? "/PMSM-Visualizations/";

export default defineConfig({
  plugins: [react()],
  // The deployed repository can provide VITE_BASE_PATH without changing app code.
  // The existing Pages route remains the default until the new repository is published.
  base: pagesBase,
  build: {
    target: "es2022",
    cssCodeSplit: true,
  },
});
