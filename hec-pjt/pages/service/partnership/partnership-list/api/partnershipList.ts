import { queryOptions, useQuery } from "@tanstack/react-query";

import {
  apiRequest,
  type PagingResponse,
  type Request,
} from "@/shared/lib/api";
import { serviceKeys } from "@/shared/query-keys";

import type { PartnershipListItem, PartnershipProcessStatusCd } from "../model";

export type PartnershipListRequest = Request<{
  query: {
    searchWord?: string;
    requestStartAt?: string;
    requestEndAt?: string;
    confirmStartAt?: string;
    confirmEndAt?: string;
    processStatusCd?: PartnershipProcessStatusCd;
    page?: number;
    size?: number;
    sort?: string[];
  };
}>;

export type PartnershipListResponse = PagingResponse<PartnershipListItem>;

export const getPartnershipList = async (params: PartnershipListRequest) => {
  const response = await apiRequest<PartnershipListResponse>(
    "get",
    "/v1/backoffice/pfmt/policy/partnership",
    params,
  );
  return response.data;
};

export const partnershipListQueryFactory = {
  list: (params: PartnershipListRequest, enabled = true) =>
    queryOptions({
      queryKey: serviceKeys.partnership.list(params),
      queryFn: () => getPartnershipList(params),
      enabled,
    }),
};

export const useGetPartnershipListQuery = (
  params: PartnershipListRequest,
  enabled = true,
) => {
  return useQuery(partnershipListQueryFactory.list(params, enabled));
};
