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
    rollupOptions: {
      output: {
        /*
         * three.js and its helpers are roughly three quarters of the payload and
         * never change between deploys. Splitting them out lets the shell paint
         * on the app chunk alone, and lets a returning reader reuse the large
         * chunk from cache across releases.
         */
        manualChunks: {
          three: ["three"],
          r3f: ["@react-three/fiber", "@react-three/drei"],
        },
      },
    },
  },
});
