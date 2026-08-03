import { useMutation, useQueryClient } from "@tanstack/react-query";

import type { FaqValuesSchema } from "@/features/faq-form/model/schema";
import { apiRequest, type Request, type Response } from "@/shared/lib/api";
import { serviceKeys } from "@/shared/query-keys";

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
      queryClient.invalidateQueries({ queryKey: serviceKeys.faq.all() });
    },
  });
};
