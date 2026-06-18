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