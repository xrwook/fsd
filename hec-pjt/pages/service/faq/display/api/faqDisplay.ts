import {
  queryOptions,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import { apiRequest, type Request, type Response } from "@/shared/lib/api";

import { faqListQueryFactory } from "../../faq-list/api/faqList";

export type FaqDisplayItem = {
  id: string;
  question: string;
  isTop10: boolean;
  version: number;
};

export type FaqDisplayAllRequest = Request<{
  path: {
    faqCategoryId: string;
  };
}>;

export type FaqDisplayAllResponse = Response<FaqDisplayItem[]>;

export type FaqDisplaySortItem = {
  id: string;
  version: number;
};

export type FaqDisplaySortRequest = Request<{
  path: {
    faqCategoryId: string;
  };
  requestBody: {
    sortedFaqs: FaqDisplaySortItem[];
  };
}>;

export const getFaqDisplayAll = async (params: FaqDisplayAllRequest) => {
  const response = await apiRequest<FaqDisplayAllResponse>(
    "get",
    "/pfmt/faq/categories/{faqCategoryId}/faqs/display/all",
    params,
  );
  return response.data;
};

export const faqDisplaySortApi = async (params: FaqDisplaySortRequest) => {
  const response = await apiRequest<Response<null>>(
    "patch",
    "/pfmt/faq/categories/{faqCategoryId}/faqs/display/sort",
    params,
  );
  return response.data;
};

export const faqDisplayQueryFactory = {
  all: () => ["faq-display"] as const,
  displayAll: (params: FaqDisplayAllRequest, enabled = true) =>
    queryOptions({
      queryKey: [
        ...faqDisplayQueryFactory.all(),
        "displayAll",
        params,
      ] as const,
      queryFn: () => getFaqDisplayAll(params),
      enabled,
    }),
};

export const useGetFaqDisplayAllQuery = (
  params: FaqDisplayAllRequest,
  enabled = true,
) => {
  return useQuery(faqDisplayQueryFactory.displayAll(params, enabled));
};

export const useFaqDisplaySortMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: FaqDisplaySortRequest) => faqDisplaySortApi(params),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: faqDisplayQueryFactory.all() });
      queryClient.invalidateQueries({ queryKey: faqListQueryFactory.all() });
    },
  });
};
