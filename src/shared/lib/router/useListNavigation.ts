import { useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";

type TListNavigationState = {
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
    (relativePath: string) => {
      const returnTo =
        getReturnTo(location.state) ??
        `${location.pathname}${location.search}`;

      navigate(resolveChildPath(location.pathname, relativePath), {
        state: { returnTo } satisfies TListNavigationState,
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

  return {
    goToDetail,
    goBackToList,
  };
};
