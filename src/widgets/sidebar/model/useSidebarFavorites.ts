import { useCallback, useEffect, useState } from "react";

import type { TMenuId } from "@/entities/user";
import { isMenuId } from "@/entities/user";

const SIDEBAR_FAVORITES_STORAGE_KEY = "sidebar-favorite-menu-ids";

const getStoredFavoriteMenuIds = () => {
  if (typeof window === "undefined") {
    return new Set<TMenuId>();
  }

  try {
    const storedValue = JSON.parse(
      window.localStorage.getItem(SIDEBAR_FAVORITES_STORAGE_KEY) ?? "[]",
    );

    if (!Array.isArray(storedValue)) {
      return new Set<TMenuId>();
    }

    return new Set(storedValue.filter((value) => isMenuId(value)));
  } catch {
    return new Set<TMenuId>();
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

  const toggleFavorite = useCallback((menuId: TMenuId) => {
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
