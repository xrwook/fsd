import { queryOptions, useQuery } from "@tanstack/react-query";

import { apiRequest, type Response } from "@/shared/lib/api";

import type { MemberSummary } from "../model/member";

const MEMBER_LIST_API_URL = "/emsp/members";

export type MemberListRequest = {
  query: {
    endDate?: string;
    keyword?: string;
    startDate?: string;
  };
};

type MemberListResponse = Response<MemberSummary[]>;

export const getMemberListApi = async ({ query }: MemberListRequest) => {
  const response = await apiRequest<MemberListResponse, MemberListRequest>(
    "get",
    MEMBER_LIST_API_URL,
    { query },
  );

  return response.data.data;
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
