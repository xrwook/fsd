import { queryOptions, useQuery } from "@tanstack/react-query";

import type { ChargingStationDetail } from "@/entities/charging-station";
import type { Request, Response } from "@/shared/lib/api";
import { apiRequest } from "@/shared/lib/api";
import { serviceKeys } from "@/shared/query-keys";

export interface LocationDetailRequestBody {
  latitude: number;
  longitude: number;
}

export type LocationDetailRequest = Request<{
  path: { locationId: string };
  requestBody: LocationDetailRequestBody;
}>;

export type LocationDetailResponse = Response<ChargingStationDetail>;

const LOCATION_DETAIL_API_URL = "/v1/poi/app/locations/{locationId}";

export const locationDetailApi = async (params: LocationDetailRequest) => {
  const response = await apiRequest<LocationDetailResponse>(
    "post",
    LOCATION_DETAIL_API_URL,
    params,
  );

  return response.data;
};

export const locationDetailQueryFactory = {
  detail: (params: LocationDetailRequest, enabled = true) =>
    queryOptions({
      queryKey: serviceKeys.stationSearch.locationDetail(params),
      queryFn: () => locationDetailApi(params),
      enabled,
      placeholderData: (previousData) => previousData,
    }),
};

export const useGetLocationDetailQuery = (
  params: LocationDetailRequest,
  enabled = true,
) => {
  return useQuery(locationDetailQueryFactory.detail(params, enabled));
};
