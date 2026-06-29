import { useCallback } from "react";
import { useSearchParams } from "react-router-dom";

type TUrlSearchParamPrimitive = string | number | boolean;
type TUrlSearchParamValue =
  | TUrlSearchParamPrimitive
  | readonly TUrlSearchParamPrimitive[]
  | null
  | undefined;

type TUrlSearchParamUpdates = Record<string, TUrlSearchParamValue>;

export const useUrlSearchParams = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const updateSearchParams = useCallback(
    (updates: TUrlSearchParamUpdates) => {
      setSearchParams(
        (previousSearchParams) => {
          const nextSearchParams = new URLSearchParams(previousSearchParams);

          for (const [key, value] of Object.entries(updates)) {
            nextSearchParams.delete(key);

            if (value === null || value === undefined || value === "") {
              continue;
            }

            if (Array.isArray(value)) {
              for (const item of value) {
                nextSearchParams.append(key, String(item));
              }
              continue;
            }

            nextSearchParams.set(key, String(value));
          }

          return nextSearchParams;
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
