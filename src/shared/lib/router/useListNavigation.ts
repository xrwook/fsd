import { useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import type { ScreenIdValues } from "@/shared/config";
import { replaceToScreen } from "@/shared/lib/navigation";

import { createFilterSearch } from "./filterSearchParams";

type ListNavigationState = {
  returnTo: string;
};

const getReturnTo = (state: unknown) => {
  if (
    typeof state !== "object" ||
    state === null ||
    !("returnTo" in state) ||
    typeof state.returnTo !== "string"
  ) {
    return null;
  }

  return state.returnTo;
};

const resolveChildPath = (parentPath: string, relativePath: string) => {
  const normalizedParentPath = parentPath.replace(/\/+$/, "");
  const normalizedRelativePath = relativePath.replace(/^\/+/, "");

  return `${normalizedParentPath}/${normalizedRelativePath}`;
};

export const useListNavigation = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const goToDetail = useCallback(
    (relativePath: string, filter?: unknown) => {
      const existingReturnTo = getReturnTo(location.state);
      const returnSearch =
        filter === undefined
          ? location.search
          : createFilterSearch(location.search, filter);
      const returnTo =
        existingReturnTo ?? `${location.pathname}${returnSearch}`;
      const detailPath = resolveChildPath(location.pathname, relativePath);

      if (!existingReturnTo && returnSearch !== location.search) {
        navigate(
          {
            pathname: location.pathname,
            search: returnSearch,
          },
          {
            replace: true,
            flushSync: true,
          },
        );
      }

      navigate(detailPath, {
        state: { returnTo } satisfies ListNavigationState,
      });
    },
    [location.pathname, location.search, location.state, navigate],
  );

  const goBackToList = useCallback(
    (fallbackPath: string) => {
      const returnTo = getReturnTo(location.state);

      navigate(returnTo ?? fallbackPath, { replace: true });
    },
    [location.state, navigate],
  );

  const goBackToListByScreenId = useCallback(
    (screenId: ScreenIdValues) => {
      const returnTo = getReturnTo(location.state);

      if (returnTo) {
        navigate(returnTo, { replace: true });
        return;
      }

      replaceToScreen(screenId);
    },
    [location.state, navigate],
  );

  return {
    goToDetail,
    goBackToList,
    goBackToListByScreenId,
  };
};
