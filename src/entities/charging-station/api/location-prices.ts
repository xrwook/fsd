import { queryOptions, useQuery } from "@tanstack/react-query";

import type { Request, Response } from "@/shared/lib/api";
import { apiRequest } from "@/shared/lib/api";
import { serviceKeys } from "@/shared/query-keys";

export interface LocationPrices {
  slowFee: string;
  fastFee: string;
  ultraFastFee: string;
}

export type LocationPricesRequest = Request<{
  path: { locationId: string };
}>;

export type LocationPricesResponse = Response<LocationPrices | null>;

const LOCATION_PRICES_API_URL = "/v1/poi/app/locations/{locationId}/prices";

export const locationPricesApi = async (params: LocationPricesRequest) => {
  const response = await apiRequest<LocationPricesResponse>(
    "get",
    LOCATION_PRICES_API_URL,
    params,
  );

  return response.data;
};

export const locationPricesQueryFactory = {
  detail: (params: LocationPricesRequest, enabled = true) =>
    queryOptions({
      queryKey: serviceKeys.stationSearch.locationPrices(params),
      queryFn: () => locationPricesApi(params),
      enabled,
    }),
};

export const useGetLocationPricesQuery = (
  params: LocationPricesRequest,
  enabled = true,
) => {
  return useQuery(locationPricesQueryFactory.detail(params, enabled));
};
