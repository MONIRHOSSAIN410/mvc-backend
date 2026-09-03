import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        // Libraries change far less often than the shop does, so they get
        // their own files and stay in the browser cache across deploys.
        manualChunks: {
          react: ["react", "react-dom", "react-router-dom"],
          redux: ["@reduxjs/toolkit", "react-redux"],
          motion: ["framer-motion"],
        },
      },
    },
  },
  server: {
    port: 5173,
    proxy: {
      "/api": {
<<<<<<< HEAD
        target: "http://localhost:5000",
=======
        target: "https://mvc-backend-b5wn.vercel.app", // Removed trailing slash
>>>>>>> 7ade7f6 (Change server port and fix proxy target URL)
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
