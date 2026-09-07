import {
  MutationCache,
  QueryCache,
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";
import type { PropsWithChildren } from "react";

import { classifyApiError, showApiErrorPage } from "@/shared/lib/api-error";

const isMainInfoQueryKey = (queryKey: readonly unknown[]) => {
  return queryKey[0] === "main-info";
};

const queryClient = new QueryClient({
  queryCache: new QueryCache({
    onError: (error, query) => {
      const pageType = classifyApiError(
        error,
        isMainInfoQueryKey(query.queryKey) ? "approvalPending" : "accessDenied",
      );

      showApiErrorPage(pageType, error);
    },
  }),
  mutationCache: new MutationCache({
    onError: (error) => {
      showApiErrorPage(classifyApiError(error), error);
    },
  }),
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

type Props = PropsWithChildren;

export const QueryProvider = ({ children }: Props) => {
  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};
