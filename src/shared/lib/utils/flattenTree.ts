/**
 * 트리 구조의 노드를 깊이 우선 순회로 1차원 배열로 평탄화합니다.
 *
 * @param nodes children 속성을 가질 수 있는 트리 노드 배열
 * @returns 부모-자식 순서가 유지된 평탄화 노드 배열
 */
export const flattenTree = <T extends { children?: T[] }>(nodes: T[]): T[] => {
  return nodes.flatMap((node) => [node, ...flattenTree(node.children ?? [])]);
};
