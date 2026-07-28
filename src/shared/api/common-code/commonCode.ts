import { queryOptions, useQuery } from "@tanstack/react-query";

import { apiRequest } from "@/shared/lib/api";
import { commonCodeKeys } from "@/shared/query-keys";

import type {
  CommonCodeDetailRequest,
  CommonCodeDetailResponse,
  CommonCodeMultiRequest,
  CommonCodeMultiResponse,
  CommonCodeRequest,
  CommonCodeResponse,
} from "./model";

const COMMON_CODE_API_URL = "/v1/backoffice/symt/code/cache/codes";
const COMMON_CODE_MULTI_API_URL = "/v1/backoffice/symt/code/cache/codes/multi";
const COMMON_CODE_DETAIL_API_URL =
  "/v1/backoffice/symt/code/cache/codes/detail";

export const getCommonCodes = async (params: CommonCodeRequest) => {
  const response = await apiRequest<CommonCodeResponse, CommonCodeRequest>(
    "get",
    COMMON_CODE_API_URL,
    params,
  );

  return response.data.data;
};

export const getCommonCodesMulti = async (params: CommonCodeMultiRequest) => {
  const response = await apiRequest<
    CommonCodeMultiResponse,
    CommonCodeMultiRequest
  >("get", COMMON_CODE_MULTI_API_URL, params);

  return response.data.data;
};

export const getCommonCodeDetail = async (params: CommonCodeDetailRequest) => {
  const response = await apiRequest<
    CommonCodeDetailResponse,
    CommonCodeDetailRequest
  >("get", COMMON_CODE_DETAIL_API_URL, params);

  return response.data.data;
};

export const commonCodeQueryFactory = {
  all: () => commonCodeKeys.all,
  detail: (params: CommonCodeDetailRequest) =>
    queryOptions({
      queryFn: () => getCommonCodeDetail(params),
      queryKey: commonCodeKeys.detail(params),
    }),
  list: (params: CommonCodeRequest) =>
    queryOptions({
      queryFn: () => getCommonCodes(params),
      queryKey: commonCodeKeys.list(params),
    }),
  multi: (params: CommonCodeMultiRequest) =>
    queryOptions({
      queryFn: () => getCommonCodesMulti(params),
      queryKey: commonCodeKeys.multi(params),
    }),
};

export const useGetCommonCodesQuery = (params: CommonCodeRequest) => {
  return useQuery(commonCodeQueryFactory.list(params));
};

export const useGetCommonCodesMultiQuery = (params: CommonCodeMultiRequest) => {
  return useQuery(commonCodeQueryFactory.multi(params));
};

export const useGetCommonCodeDetailQuery = (
  params: CommonCodeDetailRequest,
) => {
  return useQuery(commonCodeQueryFactory.detail(params));
};
