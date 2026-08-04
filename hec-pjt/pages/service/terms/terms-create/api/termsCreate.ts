import {
  queryOptions,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import type { TermValuesSchema } from "@/features/term-form";
import type { Request, Response } from "@/shared/lib/api";
import { apiRequest } from "@/shared/lib/api";
import { serviceKeys } from "@/shared/query-keys";

const skipScreenIdConfig = { skipScreenId: true } as const;

export type TermNextVersionData = {
  nextVersion: string;
  isRegistered: boolean;
};

export type TermNextVersionRequest = Request<{
  path: {
    termCode: string;
  };
}>;

export type TermCreateBody = Omit<
  TermValuesSchema,
  "ver" | "deployStatus" | "reservedAt"
> & {
  isReserved: boolean;
  reservedAt: string | null;
};

export type TermCreateRequest = Request<{
  requestBody: TermCreateBody;
}>;

export const getTermNextVersion = async (params: TermNextVersionRequest) => {
  const response = await apiRequest<Response<TermNextVersionData>>(
    "get",
    "/v1/backoffice/pfmt/policy/terms/next-version/{termCode}",
    params,
    skipScreenIdConfig,
  );
  return response.data;
};

export const createTermVersion = async (params: TermCreateRequest) => {
  const response = await apiRequest<Response<boolean>>(
    "post",
    "/v1/backoffice/pfmt/policy/terms/details",
    params,
    skipScreenIdConfig,
  );
  return response.data;
};

export const termNextVersionQueryFactory = {
  detail: (params: TermNextVersionRequest, enabled = true) =>
    queryOptions({
      queryKey: serviceKeys.policy.nextVersion(params),
      queryFn: () => getTermNextVersion(params),
      enabled,
    }),
};

export const useGetTermNextVersionQuery = (
  params: TermNextVersionRequest,
  enabled = true,
) => {
  return useQuery(termNextVersionQueryFactory.detail(params, enabled));
};

export const useCreateTermVersionMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: TermCreateRequest) => createTermVersion(params),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: serviceKeys.policy.all() });
    },
  });
};
