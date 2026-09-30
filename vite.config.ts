import { resolve } from "node:path";

import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { visualizer } from "rollup-plugin-visualizer";
import { defineConfig, loadEnv } from "vite";
import checker from "vite-plugin-checker";
import { comlink } from "vite-plugin-comlink";
import svgr from "vite-plugin-svgr";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig(({ command, mode }) => {
  // Load specific .env file
  const env = loadEnv(mode, process.cwd(), ["VITE_"]);
  const requestedBuildTarget =
    process.env.VITE_BUILD_TARGET ?? env.VITE_BUILD_TARGET ?? "internal";
  const buildTarget =
    command === "serve" || mode === "dev" ? "internal" : requestedBuildTarget;

  if (buildTarget !== "internal" && buildTarget !== "external") {
    throw new Error(
      `VITE_BUILD_TARGET must be "internal" or "external", received "${buildTarget}".`,
    );
  }

  const resolvedEnv = {
    ...env,
    VITE_BUILD_TARGET: buildTarget,
  };

  return {
    plugins: [
      react(),
      svgr(),
      tsconfigPaths(),
      checker({
        typescript: true,
        enableBuild: command !== "build",
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
    resolve: {
      alias: {
        "@extra-page-routes/emsp": resolve(
          process.cwd(),
          buildTarget === "internal"
            ? "src/app/router/extra-page-routes/emsp.ts"
            : "src/app/router/extra-page-routes/emsp.external.ts",
        ),
      },
    },
    define: {
      "import.meta.env.VITE_BUILD_TARGET": JSON.stringify(buildTarget),
      "process.env": JSON.stringify({ ...resolvedEnv, MODE: mode }),
    },
    server: {
      port: 3002,
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
        external: (source) => source.includes("msw"),
      },
    },
    worker: {
      plugins: () => [comlink()],
    },
  };
});
