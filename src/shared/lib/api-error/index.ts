import { isAxiosError } from "axios";
import { create } from "zustand";

export type ApiErrorPageType =
  | "accessDenied"
  | "approvalPending"
  | "network"
  | "temporary";

export const API_ERROR_PAGE_PATHS = {
  accessDenied: "/access-denied",
  approvalPending: "/approvalPending",
  network: "/network-error",
  temporary: "/temporary-error",
} satisfies Record<ApiErrorPageType, string>;

export type ApiErrorAccessType = Extract<
  ApiErrorPageType,
  "accessDenied" | "approvalPending"
>;

type ApiErrorState = {
  error: unknown;
  pageType: ApiErrorPageType | null;
  clearApiErrorPage: () => void;
  showApiErrorPage: (pageType: ApiErrorPageType, error: unknown) => void;
};

const TEMPORARY_ERROR_STATUSES = new Set([408, 429, 500, 502, 503, 504]);

export const classifyApiError = (
  error: unknown,
  accessType: ApiErrorAccessType = "accessDenied",
): ApiErrorPageType | null => {
  if (!isAxiosError(error)) {
    return "temporary";
  }

  const status = error.response?.status;

  if (!status) {
    return "network";
  }

  if (status === 401 || status === 403) {
    return accessType;
  }

  if (TEMPORARY_ERROR_STATUSES.has(status)) {
    return "temporary";
  }

  return null;
};

export const useApiErrorPageStore = create<ApiErrorState>((set) => ({
  error: null,
  pageType: null,
  clearApiErrorPage: () => set({ error: null, pageType: null }),
  showApiErrorPage: (pageType, error) =>
    set((state) => (state.pageType ? {} : { error, pageType })),
}));

export const showApiErrorPage = (
  pageType: ApiErrorPageType,
  error: unknown,
) => {
  useApiErrorPageStore.getState().showApiErrorPage(pageType, error);
};
