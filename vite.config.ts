import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

const repositoryName = process.env.GITHUB_REPOSITORY?.split("/")[1];
const isGitHubActions = process.env.GITHUB_ACTIONS === "true";

export default defineConfig({
  plugins: [react()],
  // GitHub Pages serves project sites from /<repository>/, so the production
  // build made by the workflow needs that base. Local builds stay at /.
  base: isGitHubActions && repositoryName ? `/${repositoryName}/` : "/",
});
