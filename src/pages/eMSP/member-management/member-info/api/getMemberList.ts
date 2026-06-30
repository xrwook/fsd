import { queryOptions, useQuery } from "@tanstack/react-query";

import { axiosInstance } from "@/shared/lib/axios";

import type { TMemberListSearchParams, TMemberSummary } from "../model/member";

const MEMBER_LIST_API_URL = "/api/emsp/members";

export const getMemberListApi = async ({
  keyword,
}: TMemberListSearchParams) => {
  const response = await axiosInstance.get<TMemberSummary[]>(
    MEMBER_LIST_API_URL,
    {
      params: keyword ? { keyword } : undefined,
    },
  );

  return response.data;
};

export const memberListQueryFactory = {
  all: () => ["member-list"] as const,
  list: (params: TMemberListSearchParams) =>
    queryOptions({
      queryKey: [...memberListQueryFactory.all(), params] as const,
      queryFn: () => getMemberListApi(params),
    }),
};

export const useGetMemberListQuery = (params: TMemberListSearchParams) => {
  return useQuery(memberListQueryFactory.list(params));
};
