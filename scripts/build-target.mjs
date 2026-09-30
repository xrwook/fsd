import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const [target = "internal", mode = "prod"] = process.argv.slice(2);
const validTargets = new Set(["internal", "external"]);

if (!validTargets.has(target)) {
  console.error(
    `Invalid build target "${target}". Use "internal" or "external".`,
  );
  process.exit(1);
}

const effectiveTarget = mode === "dev" ? "internal" : target;

const viteCli = fileURLToPath(
  new URL("../node_modules/vite/bin/vite.js", import.meta.url),
);
const result = spawnSync(process.execPath, [viteCli, "build", "--mode", mode], {
  env: {
    ...process.env,
    VITE_BUILD_TARGET: effectiveTarget,
  },
  stdio: "inherit",
});

process.exit(result.status ?? 1);
