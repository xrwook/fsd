import { queryOptions, useQuery } from "@tanstack/react-query";

import { axiosInstance } from "@/shared/lib/axios";

import type { MemberSummary } from "../model/member";

const MEMBER_LIST_API_URL = "/api/emsp/members";

export type MemberListRequest = {
  query: {
    keyword?: string;
  };
};

export const getMemberListApi = async ({ query }: MemberListRequest) => {
  const response = await axiosInstance.get<MemberSummary[]>(
    MEMBER_LIST_API_URL,
    {
      params: query.keyword ? query : undefined,
    },
  );

  return response.data;
};

export const memberListQueryFactory = {
  all: () => ["member-list"] as const,
  list: (params: MemberListRequest) =>
    queryOptions({
      queryKey: [...memberListQueryFactory.all(), params] as const,
      queryFn: () => getMemberListApi(params),
    }),
};

export const useGetMemberListQuery = (params: MemberListRequest) => {
  return useQuery(memberListQueryFactory.list(params));
};
