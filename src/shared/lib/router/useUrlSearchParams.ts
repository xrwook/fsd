import { useCallback } from "react";
import { useSearchParams } from "react-router-dom";

type UrlSearchParam = string | number | boolean;
type ParamValue = UrlSearchParam | readonly UrlSearchParam[] | null | undefined;

type ParamUpdates = Record<string, ParamValue>;

export const useUrlSearchParams = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const updateSearchParams = useCallback(
    (updates: ParamUpdates) => {
      setSearchParams(
        (previous) => {
          const next = new URLSearchParams(previous);

          for (const [key, value] of Object.entries(updates)) {
            next.delete(key);

            if (value === null || value === undefined || value === "") {
              continue;
            }

            if (Array.isArray(value)) {
              for (const item of value) {
                next.append(key, String(item));
              }
              continue;
            }

            next.set(key, String(value));
          }

          return next;
        },
        { replace: true },
      );
    },
    [setSearchParams],
  );

  const clearSearchParams = useCallback(() => {
    setSearchParams(new URLSearchParams(), { replace: true });
  }, [setSearchParams]);

  return {
    searchParams,
    updateSearchParams,
    clearSearchParams,
  };
};
