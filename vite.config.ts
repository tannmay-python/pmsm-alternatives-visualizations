import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  base: "/PMSM-Visualizations/",
  build: {
    target: "es2022",
    cssCodeSplit: true,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (
            id.includes("/three/") ||
            id.includes("@react-three") ||
            id.includes("@pmndrs")
          ) {
            return "three";
          }
          if (id.includes("/gsap/")) return "scroll";
          if (id.includes("/react/") || id.includes("/react-dom/")) return "react";
          return undefined;
        },
      },
    },
  },
});
