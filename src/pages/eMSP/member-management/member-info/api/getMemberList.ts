import { queryOptions, useQuery } from "@tanstack/react-query";

import { axiosInstance } from "@/shared/lib/axios";

import type { MemberFilterParams, MemberSummary } from "../model/member";

const MEMBER_LIST_API_URL = "/api/emsp/members";

export const getMemberListApi = async ({ keyword }: MemberFilterParams) => {
  const response = await axiosInstance.get<MemberSummary[]>(
    MEMBER_LIST_API_URL,
    {
      params: keyword ? { keyword } : undefined,
    },
  );

  return response.data;
};

export const memberListQueryFactory = {
  all: () => ["member-list"] as const,
  list: (params: MemberFilterParams) =>
    queryOptions({
      queryKey: [...memberListQueryFactory.all(), params] as const,
      queryFn: () => getMemberListApi(params),
    }),
};

export const useGetMemberListQuery = (params: MemberFilterParams) => {
  return useQuery(memberListQueryFactory.list(params));
};
