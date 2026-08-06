import {
  queryOptions,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import {
  apiRequest,
  type PagingRequest,
  type PagingResponse,
  type Request,
  type Response,
} from "@/shared/lib/api";
import { serviceKeys } from "@/shared/query-keys";

import type {
  TermTypeItem,
  TermTypeSaveItem,
} from "../../../../../features/term-type-manage-modal";
import type { TermVersionListItem } from "../model/termsList";

const skipScreenIdConfig = { skipScreenId: true } as const;

export type TermTypeListResponse = Response<TermTypeItem[]>;

export type TermTypeSaveRequest = Request<{
  requestBody: {
    items: TermTypeSaveItem[];
  };
}>;

export type TermTypeDeleteRequest = Request<{
  path: {
    termCode: string;
  };
}>;

export type TermVersionListRequest = PagingRequest<{
  path: {
    termCode: string;
  };
  query: {
    revisionReason?: string;
    isRequired?: boolean;
    deployDate?: string;
  };
}>;

export type TermVersionListResponse = PagingResponse<TermVersionListItem>;

export const getTermTypeList = async () => {
  const response = await apiRequest<TermTypeListResponse>(
    "get",
    "/v1/backoffice/pfmt/policy/terms",
    undefined,
    skipScreenIdConfig,
  );
  return response.data;
};

export const saveTermTypes = async (params: TermTypeSaveRequest) => {
  const response = await apiRequest<Response<boolean>>(
    "post",
    "/v1/backoffice/pfmt/policy/terms",
    params,
    skipScreenIdConfig,
  );
  return response.data;
};

export const deleteTermType = async (params: TermTypeDeleteRequest) => {
  const response = await apiRequest<Response<string>>(
    "delete",
    "/v1/backoffice/pfmt/policy/terms/{termCode}",
    params,
    skipScreenIdConfig,
  );
  return response.data;
};

export const getTermVersionList = async (params: TermVersionListRequest) => {
  const response = await apiRequest<TermVersionListResponse>(
    "get",
    "/v1/backoffice/pfmt/policy/terms/details/{termCode}",
    params,
    skipScreenIdConfig,
  );
  return response.data;
};

export const termTypeQueryFactory = {
  list: () =>
    queryOptions({
      queryKey: serviceKeys.policy.terms(),
      queryFn: getTermTypeList,
    }),
};

export const termVersionQueryFactory = {
  list: (params: TermVersionListRequest, enabled = true) =>
    queryOptions({
      queryKey: serviceKeys.policy.versionList(params),
      queryFn: () => getTermVersionList(params),
      enabled,
    }),
};

export const useGetTermTypeListQuery = () => {
  return useQuery(termTypeQueryFactory.list());
};

export const useGetTermVersionListQuery = (
  params: TermVersionListRequest,
  enabled = true,
) => {
  return useQuery(termVersionQueryFactory.list(params, enabled));
};

export const useSaveTermTypesMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: TermTypeSaveRequest) => saveTermTypes(params),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: serviceKeys.policy.all() });
    },
  });
};

export const useDeleteTermTypeMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: TermTypeDeleteRequest) => deleteTermType(params),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: serviceKeys.policy.all() });
    },
  });
};
