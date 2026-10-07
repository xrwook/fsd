export const DEFAULT_ZOOM = 16;
export const MAX_ZOOM = 20;
export const MIN_ZOOM = 5;

export type MapLevel = 1 | 2 | 3 | 4;
export type MarkerDisplay = 1 | 2 | 3;
export type ClusterLevel = 1 | 2;

export const getMapLevel = (zoom: number): MapLevel => {
  if (zoom >= 16) return 1;
  if (zoom >= 13) return 2;
  if (zoom >= 9) return 3;
  return 4;
};

export const getMarkerDisplay = (mapLevel: MapLevel): MarkerDisplay => {
  return mapLevel === 1 || mapLevel === 2 ? mapLevel : 3;
};

export const getClusterLevel = (mapLevel: MapLevel): ClusterLevel | null => {
  if (mapLevel === 3) return 1;
  if (mapLevel === 4) return 2;
  return null;
};
