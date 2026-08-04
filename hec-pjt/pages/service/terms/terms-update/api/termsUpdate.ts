import { useMutation, useQueryClient } from "@tanstack/react-query";

import type { TermValuesSchema } from "@/features/term-form";
import type { Request, Response } from "@/shared/lib/api";
import { apiRequest } from "@/shared/lib/api";
import { serviceKeys } from "@/shared/query-keys";

const skipScreenIdConfig = { skipScreenId: true } as const;

export type TermUpdateBody = Omit<
  TermValuesSchema,
  "termCode" | "ver" | "reservedAt"
> & {
  reservedAt: string | null;
};

export type TermUpdateRequest = Request<{
  path: {
    id: string;
  };
  requestBody: TermUpdateBody;
}>;

export const updateTermVersion = async (params: TermUpdateRequest) => {
  const response = await apiRequest<Response<boolean>>(
    "patch",
    "/v1/backoffice/pfmt/policy/terms/detail/{id}",
    params,
    skipScreenIdConfig,
  );
  return response.data;
};

export const useUpdateTermVersionMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: TermUpdateRequest) => updateTermVersion(params),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: serviceKeys.policy.all() });
    },
  });
};
