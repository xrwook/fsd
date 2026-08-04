import { queryOptions, useQuery } from "@tanstack/react-query";

import type { Request, Response } from "@/shared/lib/api";
import { apiRequest } from "@/shared/lib/api";
import { serviceKeys } from "@/shared/query-keys";

import type { TermDeployStatus } from "../../terms-list/model";

const skipScreenIdConfig = { skipScreenId: true } as const;

export type TermDetailData = {
  id: string;
  termCode: string;
  ver: string;
  deployStatus: TermDeployStatus;
  deployStatusName: string;
  deployStartAt: string | null;
  deployEndAt: string | null;
  isReserved: boolean;
  reservedAt: string | null;
  isRequired: boolean;
  isReconsentRequired: boolean;
  content: string;
  revisionReason: string;
  createdBy: string;
  createdByName: string;
  createdDate: string;
  modifiedBy: string;
  modifiedByName: string;
  modifiedDate: string;
};

export type TermDetailRequest = Request<{
  path: {
    id: string;
  };
}>;

export const getTermDetail = async (params: TermDetailRequest) => {
  const response = await apiRequest<Response<TermDetailData>>(
    "get",
    "/v1/backoffice/pfmt/policy/terms/detail/{id}",
    params,
    skipScreenIdConfig,
  );
  return response.data.data;
};

export const termDetailQueryFactory = {
  detail: (params: TermDetailRequest, enabled = true) =>
    queryOptions({
      queryKey: serviceKeys.policy.detail(params.path.id),
      queryFn: () => getTermDetail(params),
      enabled,
    }),
};

export const useGetTermDetailQuery = (
  params: TermDetailRequest,
  enabled = true,
) => {
  return useQuery(termDetailQueryFactory.detail(params, enabled));
};
