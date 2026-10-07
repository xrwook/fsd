export const DEFAULT_ZOOM = 16;
export const MAX_ZOOM = 21;
export const MIN_ZOOM = 7;

export const getClusterLevel = (zoom: number) => (zoom <= 8 ? 2 : 1);

export const getMarkerDisplay = (zoom: number) => {
  if (zoom >= 18) return 1;
  if (zoom >= 16) return 2;
  return 3;
};
