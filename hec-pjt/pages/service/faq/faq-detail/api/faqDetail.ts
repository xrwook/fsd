import {
  queryOptions,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import { apiRequest, type Request, type Response } from "@/shared/lib/api";

import { faqCreateQueryFactory } from "../../faq-create/api/faqCreate";
import { faqListQueryFactory } from "../../faq-list/api/faqList";

export type FaqDetailData = {
  id: string;
  faqCategoryId: string;
  faqCategoryName: string;
  question: string;
  answer: string;
  publishType: string;
  scheduledAt: string | null;
  isTop10: boolean;
  version: number;
};

export type FaqDetailRequest = Request<{
  path: {
    id: string;
  };
}>;

export type FaqDetailResponse = Response<FaqDetailData>;

export type DeleteFaqRequest = Request<{
  path: {
    id: string;
  };
  query: {
    version: number;
  };
}>;

export type DeleteFaqResponse = Response<string>;

export const getFaqDetail = async (params: FaqDetailRequest) => {
  const response = await apiRequest<FaqDetailResponse>(
    "get",
    "/pfmt/faq/faqs/{id}",
    params,
  );
  return response.data;
};

export const deleteFaqApi = async (request: DeleteFaqRequest) => {
  const response = await apiRequest<DeleteFaqResponse>(
    "delete",
    "/pfmt/faq/faqs/{id}",
    request,
  );
  return response.data;
};

export const faqDetailQueryFactory = {
  all: () => ["faq-detail"] as const,
  detail: (params: FaqDetailRequest, enabled = true) =>
    queryOptions({
      queryKey: [...faqDetailQueryFactory.all(), "detail", params] as const,
      queryFn: () => getFaqDetail(params),
      enabled,
    }),
};

export const useGetFaqDetailQuery = (
  params: FaqDetailRequest,
  enabled = true,
) => {
  return useQuery(faqDetailQueryFactory.detail(params, enabled));
};

export const useDeleteFaqMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: DeleteFaqRequest) => deleteFaqApi(request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: faqCreateQueryFactory.all() });
      queryClient.invalidateQueries({ queryKey: faqDetailQueryFactory.all() });
      queryClient.invalidateQueries({ queryKey: faqListQueryFactory.all() });
    },
  });
};
