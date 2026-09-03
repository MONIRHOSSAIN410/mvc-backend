import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      "/api": {
        target: "https://mvc-backend-b5wn.vercel.app/",
        changeOrigin: true,
      },
    },
  },
});
