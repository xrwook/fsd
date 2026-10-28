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



//   emsp.e-cmp.co.kr(내부용)에서는
//   https://emspapi.e-cmp.co.kr/v1/backoffice
//   이렇게 호출하는 대신 도메인 없이   /v1/backoffice
//   경로로 호출이 필요할 것 같아 수정 해주실 수 있으실까요?

// emsp.e-cmp.co.kr은 외부 노출을 안하기 위해서 CloudFront와 연결이 안되고, Private API Gateway에서 S3와 바로 연결되는 구조라서요



// emsp.e-cmp.co.kr에 -> 내부 용이네


// stg-emspapi.e-cmp.co.kr/v1/backoffice