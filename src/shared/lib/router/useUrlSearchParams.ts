import { useEffect, useRef, useState } from "react";
import { useLocation, useSearchParams } from "react-router-dom";

import {
  hasFilterSearch,
  parseFilterSearch,
  removeFilterSearch,
} from "./filterSearchParams";

const clearedReloadPaths = new Set<string>();

const isReloadNavigation = (pathname: string) => {
  if (typeof globalThis.performance?.getEntriesByType !== "function") {
    return false;
  }

  const navigationEntry = globalThis.performance
    .getEntriesByType("navigation")
    .at(0) as PerformanceNavigationTiming | undefined;

  if (navigationEntry?.type !== "reload") {
    return false;
  }

  return new URL(navigationEntry.name).pathname === pathname;
};

export const useUrlSearchParams = <Filter>(initialFilter: Filter) => {
  const location = useLocation();
  const [, setSearchParams] = useSearchParams();
  const initialFilterRef = useRef(initialFilter);
  const [shouldClearReloadFilter] = useState(() => {
    return (
      !clearedReloadPaths.has(location.pathname) &&
      isReloadNavigation(location.pathname)
    );
  });
  const [filter, setFilter] = useState<Filter>(() => {
    return shouldClearReloadFilter
      ? initialFilterRef.current
      : parseFilterSearch(location.search, initialFilterRef.current);
  });

  useEffect(() => {
    if (!shouldClearReloadFilter) {
      return;
    }

    clearedReloadPaths.add(location.pathname);

    if (!hasFilterSearch(location.search)) {
      return;
    }

    setSearchParams(removeFilterSearch(location.search), { replace: true });
  }, [
    location.pathname,
    location.search,
    setSearchParams,
    shouldClearReloadFilter,
  ]);

  return [filter, setFilter] as const;
};
