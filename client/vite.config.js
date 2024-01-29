import { defineConfig } from "vite";

export default defineConfig({
  build: {
    outDir: "../server/public",
    emptyOutDir: true,
  },
  server: {
    proxy: {
      "/api": {
        target: "http://localhost:3001",
        changeOrigin: true,
      },
    },
  },
});
