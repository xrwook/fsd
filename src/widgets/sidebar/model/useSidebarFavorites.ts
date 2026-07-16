import { useCallback, useEffect, useState } from "react";

const SIDEBAR_FAVORITES_STORAGE_KEY = "sidebar-favorite-menu-ids";

const getStoredFavoriteMenuIds = () => {
  if (typeof window === "undefined") {
    return new Set<string>();
  }

  try {
    const storedValue = JSON.parse(
      window.localStorage.getItem(SIDEBAR_FAVORITES_STORAGE_KEY) ?? "[]",
    );

    if (!Array.isArray(storedValue)) {
      return new Set<string>();
    }

    return new Set(
      storedValue.filter((value): value is string => typeof value === "string"),
    );
  } catch {
    return new Set<string>();
  }
};

export const useSidebarFavorites = () => {
  const [favoriteMenuIds, setFavoriteMenuIds] = useState(
    getStoredFavoriteMenuIds,
  );

  useEffect(() => {
    window.localStorage.setItem(
      SIDEBAR_FAVORITES_STORAGE_KEY,
      JSON.stringify([...favoriteMenuIds]),
    );
  }, [favoriteMenuIds]);

  const toggleFavorite = useCallback((menuId: string) => {
    setFavoriteMenuIds((current) => {
      const next = new Set(current);

      if (next.has(menuId)) {
        next.delete(menuId);
      } else {
        next.add(menuId);
      }

      return next;
    });
  }, []);

  return {
    favoriteMenuIds,
    toggleFavorite,
  };
};
