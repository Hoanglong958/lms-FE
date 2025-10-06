import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import svgr from "vite-plugin-svgr";
import path from "path";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), svgr()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"), // alias @ → src
      "@components": path.resolve(__dirname, "./src/components"), // alias @components → src/components
      "@features": path.resolve(__dirname, "./src/features"), // alias @features → src/features
      "@layouts": path.resolve(__dirname, "./src/layouts"), // alias @layouts → src/layouts
      "@pages": path.resolve(__dirname, "./src/pages"), // alias @pages → src/pages
      "@routes": path.resolve(__dirname, "./src/routes"), // alias @routes → src/routes
      "@utils": path.resolve(__dirname, "./src/utils"), // alias @utils → src/utils
      "@assets": path.resolve(__dirname, "./src/assets"), // alias @assets → src/assets
      "@styles": path.resolve(__dirname, "./src/styles"), // alias @styles → src/styles
    },
  },
});
