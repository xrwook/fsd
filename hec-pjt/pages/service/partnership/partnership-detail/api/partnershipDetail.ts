import {
  queryOptions,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import { apiRequest, type Request, type Response } from "@/shared/lib/api";
import { serviceKeys } from "@/shared/query-keys";

import type { PartnershipProcessStatusCd } from "../../partnership-list/model";

export type PartnershipDetailData = {
  partnershipId: number;
  companyName: string;
  adminName: string;
  hpNum: string;
  email: string;
  requestContent: string;
  requestAt: string;
  confirmAdminId: string | null;
  confirmAdminName: string | null;
  confirmAt: string | null;
  processStatusCd: PartnershipProcessStatusCd;
  processStatusName: string;
  canConfirm: boolean;
};

export type PartnershipDetailRequest = Request<{
  path: {
    partnershipId: number;
  };
}>;

export type PartnershipDetailResponse = Response<PartnershipDetailData>;

export type ConfirmPartnershipRequest = Request<{
  path: {
    partnershipId: number;
  };
  requestBody: {
    isConfirmed: boolean;
    agreed: boolean;
  };
}>;

export type ConfirmPartnershipData = {
  partnershipId: number;
  processStatusCd: "CONFIRMED";
  processStatusName: string;
  confirmAdminId: string;
  confirmAdminName: string;
  confirmAt: string;
};

export type ConfirmPartnershipResponse = Response<ConfirmPartnershipData>;

export const getPartnershipDetail = async (
  params: PartnershipDetailRequest,
) => {
  const response = await apiRequest<PartnershipDetailResponse>(
    "get",
    "/v1/backoffice/pfmt/policy/partnership/{partnershipId}",
    params,
  );
  return response.data;
};

export const confirmPartnership = async (params: ConfirmPartnershipRequest) => {
  const response = await apiRequest<ConfirmPartnershipResponse>(
    "patch",
    "/v1/backoffice/pfmt/policy/partnership/{partnershipId}/confirm",
    params,
  );
  return response.data;
};

export const partnershipDetailQueryFactory = {
  detail: (params: PartnershipDetailRequest, enabled = true) =>
    queryOptions({
      queryKey: serviceKeys.partnership.detail(params.path.partnershipId),
      queryFn: () => getPartnershipDetail(params),
      enabled,
    }),
};

export const useGetPartnershipDetailQuery = (
  params: PartnershipDetailRequest,
  enabled = true,
) => {
  return useQuery(partnershipDetailQueryFactory.detail(params, enabled));
};

export const useConfirmPartnershipMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: ConfirmPartnershipRequest) =>
      confirmPartnership(params),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: serviceKeys.partnership.all(),
      });
    },
  });
};
