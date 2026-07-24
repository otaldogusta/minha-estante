import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import svgr from "vite-plugin-svgr";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";
import path from "node:path";

export default defineConfig({
  resolve: {
    alias: {
      // Redireciona o módulo do runtime Cloudflare para o shim local
      "cloudflare:workers": path.resolve(__dirname, "src/lib/cloudflare-workers-shim.ts"),
    },
  },
  plugins: [
    tsconfigPaths(),
    tailwindcss(),
    tanstackStart({
      server: {
        preset: process.env.VERCEL ? "vercel" : "node",
      },
    }),
    react(),
    svgr(),
  ],
});