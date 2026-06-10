import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { visualizer } from "rollup-plugin-visualizer";
import { defineConfig, loadEnv } from "vite";
import checker from "vite-plugin-checker";
import { comlink } from "vite-plugin-comlink";
import Pages from "vite-plugin-pages";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig(({ mode }) => {
  // Load specific .env file
  const env = loadEnv(mode, process.cwd(), ["VITE_"]);

  return {
    plugins: [
      Pages({
        dirs: [{ dir: "src/app/routes", baseRoute: "" }],
        importMode: "async",
      }),
      react(),
      tsconfigPaths(),
      checker({
        typescript: true,
      }),
      comlink(),
      visualizer({
        emitFile: true,
        open: true,
        filename: "bundle-analyze.html",
        gzipSize: true,
      }),
      tailwindcss(),
    ],
    define: {
      "process.env": JSON.stringify({ ...env, MODE: mode }),
    },
    server: {
      port: 3000,
      open: true,
      proxy: {
        "/api": {
          target: env.VITE_API_URL,
          rewrite: (path) => path.replace(/^\/api/, ""),
          changeOrigin: true,
          secure: false,
        },
      },
      watch: {
        ignored: ["**/.history/**", "**/.react-router/**", "**/build/**"],
      },
    },
    build: {
      rollupOptions: {
        output: {
          manualChunks: (id) => {
            if (/react|react-dom/.test(id)) {
              return "vendor-react";
            }

            // External modules
            if (/node_modules/.test(id)) {
              const module = id.split("node_modules/").pop()?.split("/")[0];

              return `vendor-${module}`;
            }
          },
        },
        external: (source) => {
          if (source.includes("msw")) {
            return true;
          }

          return false;
        },
      },
    },
    worker: {
      plugins: () => [comlink()],
    },
  };
});
