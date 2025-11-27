import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import svgr from "vite-plugin-svgr";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), svgr()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"), // alias @ → src
      "@components": path.resolve(__dirname, "./src/shared/components"), // alias @components → src/components
      "@features": path.resolve(__dirname, "./src/features"), // alias @features → src/features
      "@layouts": path.resolve(__dirname, "./src/shared/layouts"), // alias @layouts → src/layouts
      "@pages": path.resolve(__dirname, "./src/pages"), // alias @pages → src/pages
      "@routes": path.resolve(__dirname, "./src/routes"), // alias @routes → src/routes
      "@utils": path.resolve(__dirname, "./src/shared/utils"), // alias @utils → src/utils
      "@assets": path.resolve(__dirname, "./src/assets"), // alias @assets → src/assets
      "@styles": path.resolve(__dirname, "./src/styles"), // alias @styles → src/styles
      "@hooks": path.resolve(__dirname, "./src/shared/hooks"), // alias @hooks → src/hooks
      "@data": path.resolve(__dirname, "./src/data"), // alias @data → src/data
      "@services": path.resolve(__dirname, "./src/services"), // alias @services → src/services
      "@config": path.resolve(__dirname, "./src/config"), // alias @config → src/config
      "@admin": path.resolve(__dirname, "./src/features/Admin"), // alias @admin → src/features/Admin
    },
  },
  server: {
    proxy: {
      "/api": {
        target: "http://localhost:3900",
        changeOrigin: true,
      },
    },
  },
});
