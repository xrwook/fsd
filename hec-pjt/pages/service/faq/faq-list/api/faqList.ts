import { queryOptions, useQuery } from "@tanstack/react-query";

import {
  apiRequest,
  type PagingRequest,
  type PagingResponse,
} from "@/shared/lib/api";
import { serviceKeys } from "@/shared/query-keys";

import type { FaqListItem } from "../model/faqList";

export type FaqListRequest = PagingRequest<{
  query: {
    searchFaqCategoryId?: string;
    searchKeyword?: string;
    searchPublishType?: string;
    searchStartPublishedAt?: string;
    searchEndPublishedAt?: string;
    page?: number;
    size?: number;
    sort?: string[];
  };
}>;

export type FaqListResponse = PagingResponse<FaqListItem>;

export const getFaqList = async (params: FaqListRequest) => {
  const response = await apiRequest<FaqListResponse>(
    "get",
    "/pfmt/faq/faqs",
    params,
  );
  return response.data;
};

export const faqListQueryFactory = {
  list: (params: FaqListRequest, enabled = true) =>
    queryOptions({
      queryKey: serviceKeys.faq.list(params),
      queryFn: () => getFaqList(params),
      enabled,
    }),
};

export const useGetFaqListQuery = (params: FaqListRequest, enabled = true) => {
  return useQuery(faqListQueryFactory.list(params, enabled));
};
