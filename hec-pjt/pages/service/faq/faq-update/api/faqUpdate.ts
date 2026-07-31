import { useMutation, useQueryClient } from "@tanstack/react-query";

import type { FaqValuesSchema } from "@/features/faq-form/model/schema";
import { apiRequest, type Request, type Response } from "@/shared/lib/api";

import { faqCreateQueryFactory } from "../../faq-create/api/faqCreate";
import { faqDetailQueryFactory } from "../../faq-detail/api/faqDetail";
import { faqListQueryFactory } from "../../faq-list/api/faqList";

export type FaqUpdateType = Omit<FaqValuesSchema, "scheduledAt"> & {
  scheduledAt: string | null;
};

export type FaqUpdateRequest = Request<{
  requestBody: FaqUpdateType;
  path: {
    id: string;
  };
}>;

export const faqUpdateApi = async (params: FaqUpdateRequest) => {
  const response = await apiRequest<Response<null>>(
    "patch",
    "/pfmt/faq/faqs/{id}",
    params,
  );
  return response.data;
};

export const useFaqUpdateMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: FaqUpdateRequest) => faqUpdateApi(params),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: faqCreateQueryFactory.all() });
      queryClient.invalidateQueries({ queryKey: faqDetailQueryFactory.all() });
      queryClient.invalidateQueries({ queryKey: faqListQueryFactory.all() });
    },
  });
};
