import path from "path";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    host: "0.0.0.0",
    port: 5173,
    strictPort: true,
    proxy: {
      "/admin": {
        target: "https://backend-599200532420.europe-west4.run.app",
        changeOrigin: true,
        secure: true,
        rewrite: (path) => path.replace(/^\/admin/, "/admin"),
      },
    },
  },
});
