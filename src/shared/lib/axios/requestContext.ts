let currentPageId: string | null = null;

export const getRequestPageId = () => {
  return currentPageId;
};

export const setRequestPageId = (pageId: string) => {
  currentPageId = pageId;
};

export const clearRequestPageId = (pageId: string) => {
  if (currentPageId === pageId) {
    currentPageId = null;
  }
};
