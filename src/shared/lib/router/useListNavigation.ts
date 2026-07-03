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
    (path: string) => {
      const returnTo = `${location.pathname}${location.search}`;

      navigate(
        {
          pathname: resolveChildPath(location.pathname, path),
          search: location.search,
        },
        {
          state: { returnTo } satisfies TListNavigationState,
        },
      );
    },
    [location.pathname, location.search, navigate],
  );

  const goBackToList = useCallback(
    (path: string) => {
      if (getReturnTo(location.state)) {
        navigate(-1);
        return null;
      }

      navigate(
        {
          pathname: path,
          search: location.search,
        },
        { replace: true },
      );
    },
    [location.search, location.state, navigate],
  );

  return {
    goToDetail,
    goBackToList,
  };
};
