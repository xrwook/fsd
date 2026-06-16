/**
 * 트리 구조의 노드를 깊이 우선 순회로 1차원 배열로 평탄화합니다.
 *
 * @param nodes 평탄화할 트리 노드 배열
 * @param getChildren 각 노드에서 자식 배열을 가져오는 함수
 * @returns 부모-자식 순서가 유지된 평탄화 노드 배열
 */
export const flattenTree = <T>(
  nodes: T[],
  getChildren: (node: T) => T[] | undefined,
): T[] => {
  return nodes.flatMap((node) => [
    node,
    ...flattenTree(getChildren(node) ?? [], getChildren),
  ]);
};
