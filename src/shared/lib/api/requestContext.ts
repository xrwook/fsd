let currentScreenId: string | null = null;

export const getRequestScreenId = () => {
  return currentScreenId;
};

export const setRequestScreenId = (screenId: string) => {
  currentScreenId = screenId;
};

export const clearRequestScreenId = (screenId: string) => {
  if (currentScreenId === screenId) {
    currentScreenId = null;
  }
};
