import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  // Relative assets keep the build portable: it works at / locally and under
  // /readme-studio/ on GitHub Pages without a repository-specific base.
  base: "./",
});
