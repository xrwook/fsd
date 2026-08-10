import {
  queryOptions,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import { apiRequest, type Request, type Response } from "@/shared/lib/api";
import { serviceKeys } from "@/shared/query-keys";

import type {
  PartnershipReceiver,
  PartnershipRegistrableReceiver,
} from "../model";

export type PartnershipReceiverListResponse = Response<PartnershipReceiver[]>;

export type PartnershipRegistrableReceiverListRequest = Request<{
  query?: {
    keyword?: string;
    companyId?: string;
  };
}>;

export type PartnershipRegistrableReceiverListResponse = Response<
  PartnershipRegistrableReceiver[]
>;

export type CreatePartnershipReceiversRequest = Request<{
  requestBody: {
    adminIds: string[];
  };
}>;

export type CreatePartnershipReceiversData = {
  registeredCount: number;
  receivers: PartnershipReceiver[];
};

export type CreatePartnershipReceiversResponse =
  Response<CreatePartnershipReceiversData>;

export type DeletePartnershipReceiverRequest = Request<{
  path: {
    partnershipReceiverId: number;
  };
}>;

export type DeletePartnershipReceiverResponse = Response<boolean>;

export const getPartnershipReceivers = async () => {
  const response = await apiRequest<PartnershipReceiverListResponse>(
    "get",
    "/v1/backoffice/pfmt/policy/partnership/receivers",
  );
  return response.data;
};

export const getPartnershipRegistrableReceivers = async (
  params: PartnershipRegistrableReceiverListRequest = {},
) => {
  const response = await apiRequest<PartnershipRegistrableReceiverListResponse>(
    "get",
    "/v1/backoffice/pfmt/policy/partnership/receivers/registrable",
    params,
  );
  return response.data;
};

export const createPartnershipReceivers = async (
  params: CreatePartnershipReceiversRequest,
) => {
  const response = await apiRequest<CreatePartnershipReceiversResponse>(
    "post",
    "/v1/backoffice/pfmt/policy/partnership/receivers",
    params,
  );
  return response.data;
};

export const deletePartnershipReceiver = async (
  params: DeletePartnershipReceiverRequest,
) => {
  const response = await apiRequest<DeletePartnershipReceiverResponse>(
    "delete",
    "/v1/backoffice/pfmt/policy/partnership/receivers/{partnershipReceiverId}",
    params,
  );
  return response.data;
};

export const partnershipReceiverQueryFactory = {
  list: (enabled = true) =>
    queryOptions({
      queryKey: serviceKeys.partnership.receiverList(),
      queryFn: getPartnershipReceivers,
      enabled,
    }),
  registrableList: (
    params: PartnershipRegistrableReceiverListRequest = {},
    enabled = true,
  ) =>
    queryOptions({
      queryKey: serviceKeys.partnership.registrableReceiverList(params),
      queryFn: () => getPartnershipRegistrableReceivers(params),
      enabled,
    }),
};

export const useGetPartnershipReceiversQuery = (enabled = true) => {
  return useQuery(partnershipReceiverQueryFactory.list(enabled));
};

export const useGetPartnershipRegistrableReceiversQuery = (
  params: PartnershipRegistrableReceiverListRequest = {},
  enabled = true,
) => {
  return useQuery(
    partnershipReceiverQueryFactory.registrableList(params, enabled),
  );
};

export const useCreatePartnershipReceiversMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: CreatePartnershipReceiversRequest) =>
      createPartnershipReceivers(params),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: serviceKeys.partnership.receivers(),
      });
    },
  });
};

export const useDeletePartnershipReceiverMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: DeletePartnershipReceiverRequest) =>
      deletePartnershipReceiver(params),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: serviceKeys.partnership.receivers(),
      });
    },
  });
};
