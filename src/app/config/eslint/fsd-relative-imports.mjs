/**
 * FSD 세그먼트 내에서 상대경로 사용을 강제하는 ESLint 규칙
 */
import path from "node:path";

const FSD_SEGMENTS = ["entities", "features", "widgets", "pages"];

/**
 * 파일 경로에서 FSD 세그먼트와 슬라이스를 추출
 * @param {string} filePath
 * @returns {{ segment: string, slice: string, fullSegmentPath: string } | null}
 */
function extractSegmentAndSlice(filePath) {
  const match = filePath.match(
    /\/src\/(entities|features|widgets|pages)\/([^/]+)/,
  );
  if (!match) return null;

  return {
    segment: match[1],
    slice: match[2],
    fullSegmentPath: `${match[1]}/${match[2]}`,
  };
}

/**
 * import 경로에서 FSD 세그먼트와 슬라이스를 추출
 * @param {string} importPath
 * @returns {{ segment: string, slice: string, fullSegmentPath: string } | null}
 */
function extractImportSegmentAndSlice(importPath) {
  const match = importPath.match(
    /^@\/(entities|features|widgets|pages)\/([^/]+)/,
  );
  if (!match) return null;

  return {
    segment: match[1],
    slice: match[2],
    fullSegmentPath: `${match[1]}/${match[2]}`,
  };
}

const fsdRelativeImportsRule = {
  meta: {
    type: "problem",
    docs: {
      description: "FSD 세그먼트 내에서는 상대경로를 사용하도록 강제",
      category: "Best Practices",
    },
    fixable: null,
    schema: [],
  },

  create(context) {
    return {
      ImportDeclaration(node) {
        const fileName = context.getFilename();
        const importPath = node.source.value;

        // 절대경로 import만 검사 (@로 시작)
        if (!importPath.startsWith("@/")) return;

        const fileSegmentInfo = extractSegmentAndSlice(fileName);
        const importSegmentInfo = extractImportSegmentAndSlice(importPath);

        // 파일이 FSD 세그먼트에 속하지 않으면 무시
        if (!fileSegmentInfo) return;

        // import가 FSD 세그먼트가 아니면 무시
        if (!importSegmentInfo) return;

        // 같은 세그먼트의 같은 슬라이스 내에서 import하는 경우
        if (
          fileSegmentInfo.fullSegmentPath === importSegmentInfo.fullSegmentPath
        ) {
          context.report({
            node: node.source,
            message: `같은 ${fileSegmentInfo.fullSegmentPath} 슬라이스 내에서는 절대경로(@/) 대신 상대경로(./, ../)를 사용하세요.`,
          });
        }
      },
    };
  },
};

/**
 * FSD 레이어에서 다른 슬라이스를 직접 import하는 것을 금지하는 ESLint 규칙
 * - 같은 슬라이스 내 import: 허용
 * - @x 폴더를 통한 cross-slice import: 허용
 * - 다른 슬라이스 직접 import: 금지
 */
const fsdNoCrossSliceRule = {
  meta: {
    type: "problem",
    docs: {
      description: "FSD 레이어에서 다른 슬라이스를 직접 import하는 것을 금지",
      category: "Best Practices",
    },
    schema: [],
  },

  create(context) {
    return {
      ImportDeclaration(node) {
        const fileName = context.filename ?? context.getFilename();
        const importPath = node.source.value;

        const fileInfo = extractSegmentAndSlice(fileName);
        if (!fileInfo) return;

        let importLayer;
        let importSlice;
        let throughAtX;

        if (importPath.startsWith("@/")) {
          // 절대경로: @/entities/post/... 형태
          const match = importPath.match(
            /^@\/(entities|features|widgets|pages)\/([^/@]+)/,
          );
          if (!match) return;
          importLayer = match[1];
          importSlice = match[2];
          throughAtX = importPath.includes("/@x");
        } else if (importPath.startsWith(".")) {
          // 상대경로: resolve해서 어느 슬라이스인지 확인
          const fileDir = path.dirname(fileName);
          const resolved = path.resolve(fileDir, importPath);
          const match = resolved.match(
            /\/src\/(entities|features|widgets|pages)\/([^/]+)/,
          );
          if (!match) return;
          importLayer = match[1];
          importSlice = match[2];
          throughAtX = resolved.includes("/@x");
        } else {
          return;
        }

        // 다른 레이어는 별도 룰로 처리
        if (importLayer !== fileInfo.segment) return;
        // 같은 슬라이스 내 import는 허용
        if (importSlice === fileInfo.slice) return;
        // @x를 통한 cross-slice import는 허용
        if (throughAtX) return;

        context.report({
          node: node.source,
          message: `다른 슬라이스(${importLayer}/${importSlice})를 직접 import할 수 없습니다. 필요시 @x 폴더를 통해 공개하세요.`,
        });
      },
    };
  },
};

export default {
  rules: {
    "relative-imports": fsdRelativeImportsRule,
    "no-cross-slice": fsdNoCrossSliceRule,
  },
};
