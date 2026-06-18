/**
 * FSD (Feature-Sliced Design) 아키텍처 규칙
 * @type {import('eslint').Linter.RulesRecord}
 * @see https://feature-sliced.design/
 * @see https://github.com/import-js/eslint-plugin-import/blob/main/docs/rules/no-restricted-paths.md
 */
const fsdRules = {
  "import/no-restricted-paths": [
    "error",
    {
      zones: [
        // shared: 상위 레이어 전면 차단 (동일 레이어 cross-import 없음)
        {
          target: "./src/shared",
          from: [
            "./src/entities",
            "./src/features",
            "./src/widgets",
            "./src/pages",
            "./src/app",
          ],
          message:
            "shared에서는 entities|features|widgets|pages|app을 import할 수 없습니다.",
        },

        // entities: 상위 레이어 전면 차단 (동일 레이어 cross-slice는 fsd/no-cross-slice 규칙으로 처리)
        {
          target: "./src/entities",
          from: ["./src/features", "./src/widgets", "./src/pages", "./src/app"],
          message:
            "entities에서는 상위 레이어(features|widgets|pages|app)를 import할 수 없습니다.",
        },

        // features: 상위 레이어 전면 차단 (동일 레이어 cross-slice는 fsd/no-cross-slice 규칙으로 처리)
        {
          target: "./src/features",
          from: ["./src/widgets", "./src/pages", "./src/app"],
          message:
            "features에서는 상위 레이어(widgets|pages|app)를 import할 수 없습니다.",
        },

        // widgets: 상위 레이어 전면 차단 (동일 레이어 cross-slice는 fsd/no-cross-slice 규칙으로 처리)
        {
          target: "./src/widgets",
          from: ["./src/pages", "./src/app"],
          message:
            "widgets에서는 상위 레이어(pages|app)를 import할 수 없습니다.",
        },

        // pages: 상위 레이어 전면 차단 (동일 레이어 cross-slice는 fsd/no-cross-slice 규칙으로 처리)
        {
          target: "./src/pages",
          from: ["./src/app"],
          message: "pages에서는 상위 레이어(app)를 import할 수 없습니다.",
        },
      ],
    },
  ],
  "no-restricted-imports": [
    "error",
    {
      patterns: [
        {
          group: [
            "@/**/api",
            "@/**/*.config",
            "@/**/model",
            "@/**/lib",
            "@/**/ui",
            "@/**/api/*",
            "!@/pages/**/*.api",
            "!@/shared/**",
            "!@/pages/**/*.config",
            "!@/pages/**/*.model",
            "!@/pages/**/*.lib",
          ],
          message:
            "직접 .api, .config, .model, .lib, ui 파일을 import하지 말고, 서비스 레이어를 통해 접근하세요.",
        },
      ],
    },
  ],
};

export default fsdRules;
