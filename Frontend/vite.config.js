// Vite configuration file - defines how Vite builds and serves our React app
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

// Export Vite configuration with React plugin enabled
// https://vitejs.dev/config/
export default defineConfig({
  // Enable React plugin for JSX transformation and hot reload
  plugins: [react()],

  // Development server configuration
  server: {
    // Port for development server (default is 5173)
    port: 3000,
    // Open browser automatically when dev server starts
    // open: true,
  },

  // Build configuration
  build: {
    // Output directory for production build
    outDir: "dist",
    // Generate source maps for debugging in production
    sourcemap: true,
  },

  // Path resolution aliases for cleaner imports
  resolve: {
    alias: {
      // Allow @/ to reference src/ directory
      "@": "/src",
    },
  },
});
