import {
  MutationCache,
  QueryCache,
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";
import { isCancel } from "axios";
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

      if (pageType) {
        showApiErrorPage(pageType, error);
      }
    },
  }),
  mutationCache: new MutationCache({
    onError: (error) => {
      const pageType = classifyApiError(error);

      if (pageType) {
        showApiErrorPage(pageType, error);
      }
    },
  }),
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      // 수정: 세션 만료 처리 - 로그인 이동으로 취소한 요청은 재시도하지 않습니다.
      retry: (failureCount, error) => !isCancel(error) && failureCount < 1,
    },
  },
});

type Props = PropsWithChildren;

export const QueryProvider = ({ children }: Props) => {
  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};
