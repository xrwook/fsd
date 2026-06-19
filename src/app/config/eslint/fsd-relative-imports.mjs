import path from 'node:path';

const PATH_ALIAS = '@/';
const SOURCE_DIRECTORY = '/src/';

const FSD_LAYERS = new Set([
  'app',
  'pages',
  'widgets',
  'features',
  'entities',
  'shared',
]);

const SLICED_LAYERS = new Set([
  'pages',
  'widgets',
  'features',
  'entities',
]);

const normalizePath = (path) => path.replaceAll('\\', '/');

const isFileName = (pathPart) => pathPart.includes('.');

const getPathPartsFromFile = (filePath) => {
  const normalizedPath = normalizePath(filePath);
  const sourceDirectoryIndex = normalizedPath.lastIndexOf(SOURCE_DIRECTORY);

  if (sourceDirectoryIndex === -1) {
    return null;
  }

  return normalizedPath
    .slice(sourceDirectoryIndex + SOURCE_DIRECTORY.length)
    .split('/')
    .filter(Boolean);
};

const getPathPartsFromAlias = (importPath) => {
  if (!importPath.startsWith(PATH_ALIAS)) {
    return null;
  }

  return importPath.slice(PATH_ALIAS.length).split('/').filter(Boolean);
};

const getFsdScope = (pathParts) => {
  if (!pathParts?.length) {
    return null;
  }

  const [layer, sliceOrSegment] = pathParts;

  if (!FSD_LAYERS.has(layer)) {
    return null;
  }

  if (SLICED_LAYERS.has(layer)) {
    if (!sliceOrSegment || isFileName(sliceOrSegment)) {
      return null;
    }

    return {
      layer,
      scope: sliceOrSegment,
    };
  }

  return {
    layer,
    scope:
      sliceOrSegment && !isFileName(sliceOrSegment) ? sliceOrSegment : null,
  };
};

const shouldUseRelativeImport = (filename, importPath) => {
  const currentScope = getFsdScope(getPathPartsFromFile(filename));
  const targetScope = getFsdScope(getPathPartsFromAlias(importPath));

  if (!currentScope || !targetScope) {
    return false;
  }

  return (
    currentScope.layer === targetScope.layer &&
    currentScope.scope === targetScope.scope
  );
};

const getRelativeImportPath = (filename, importPath) => {
  const currentPathParts = getPathPartsFromFile(filename);
  const targetPathParts = getPathPartsFromAlias(importPath);

  if (!currentPathParts || !targetPathParts) {
    return null;
  }

  const currentDirectory = currentPathParts.slice(0, -1).join('/');
  const targetPath = targetPathParts.join('/');
  const relativePath = path.posix.relative(currentDirectory, targetPath);

  return relativePath.startsWith('.') ? relativePath : `./${relativePath}`;
};

const checkImportPath = (context, node) => {
  const importPath = node.source?.value;

  if (
    typeof importPath !== 'string' ||
    !shouldUseRelativeImport(context.filename, importPath)
  ) {
    return;
  }

  context.report({
    node: node.source,
    message:
      '같은 FSD slice/segment 내부 import는 alias 대신 상대경로를 사용하세요.',
    fix(fixer) {
      const relativeImportPath = getRelativeImportPath(
        context.filename,
        importPath,
      );

      if (!relativeImportPath) {
        return null;
      }

      const quote = node.source.raw?.startsWith("'") ? "'" : '"';

      return fixer.replaceText(
        node.source,
        `${quote}${relativeImportPath}${quote}`,
      );
    },
  });
};

export default {
  rules: {
    'relative-imports': {
      meta: {
        type: 'suggestion',
        docs: {
          description:
            '같은 FSD slice 또는 segment 내부에서는 상대경로 import를 강제합니다.',
        },
        fixable: 'code',
        schema: [],
      },
      create(context) {
        return {
          ImportDeclaration(node) {
            checkImportPath(context, node);
          },
          ExportAllDeclaration(node) {
            checkImportPath(context, node);
          },
          ExportNamedDeclaration(node) {
            checkImportPath(context, node);
          },
        };
      },
    },
  },
};
