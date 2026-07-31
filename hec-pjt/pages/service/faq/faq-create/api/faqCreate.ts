import {
  queryOptions,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import type { FaqValuesSchema } from "@/features/faq-form/model/schema";
import { apiRequest, type Request, type Response } from "@/shared/lib/api";

import { faqListQueryFactory } from "../../faq-list/api/faqList";

export type FaqCreateType = Omit<FaqValuesSchema, "scheduledAt"> & {
  scheduledAt: string | null;
};

export type FaqCreateRequest = Request<{
  requestBody: FaqCreateType;
}>;

export type FaqTop10StatusRequest = Request<{
  query?: {
    id?: string;
  };
}>;

export type FaqTop10StatusData = {
  isTop10Available: boolean;
  countTop10: number;
};

export type FaqTop10StatusResponse = Response<FaqTop10StatusData>;

export const faqCreateApi = async (params: FaqCreateRequest) => {
  const response = await apiRequest<Response<null>>(
    "post",
    "/pfmt/faq/faqs",
    params,
  );
  return response.data;
};

export const getFaqTop10Status = async (params: FaqTop10StatusRequest = {}) => {
  const response = await apiRequest<FaqTop10StatusResponse>(
    "get",
    "/pfmt/faq/faqs/top10/status",
    params,
  );
  return response.data;
};

export const faqCreateQueryFactory = {
  all: () => ["faq-create"] as const,
  top10Status: (params: FaqTop10StatusRequest = {}, enabled = true) =>
    queryOptions({
      queryKey: [
        ...faqCreateQueryFactory.all(),
        "top10Status",
        params,
      ] as const,
      queryFn: () => getFaqTop10Status(params),
      enabled,
    }),
};

export const useGetFaqTop10StatusQuery = (
  params: FaqTop10StatusRequest = {},
  enabled = true,
) => {
  return useQuery(faqCreateQueryFactory.top10Status(params, enabled));
};

export const useFaqCreateMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: FaqCreateRequest) => faqCreateApi(params),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: faqCreateQueryFactory.all() });
      queryClient.invalidateQueries({ queryKey: faqListQueryFactory.all() });
    },
  });
};
