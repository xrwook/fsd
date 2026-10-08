import { queryOptions, useQuery } from "@tanstack/react-query";

import type { Request, Response } from "@/shared/lib/api";
import { apiRequest } from "@/shared/lib/api";
import { serviceKeys } from "@/shared/query-keys";

export interface LocationKeywordSearch {
  searchType: string;
  text: string;
}

export interface LocationsRequestBody {
  latitude: number;
  longitude: number;
  radiusMeters?: number;
  locationIds?: string[];
  minLatitude?: number;
  maxLatitude?: number;
  minLongitude?: number;
  maxLongitude?: number;
  keywordSearch?: LocationKeywordSearch;
  publicOpenYn?: boolean;
  availableLocationYn?: boolean;
  chargerTypes?: string[];
  chargingSpeedRange?: number[];
  freeParkingYn?: boolean;
  qrScanYn?: boolean;
  pncYn?: boolean;
}

export type LocationsRequest = Request<{
  query: {
    page?: number;
    size?: number;
    sort?: string[];
  };
  requestBody: LocationsRequestBody;
}>;

export interface ChargingSpeedDivisionCount {
  availCpkW: number;
  availableCount: number;
  totalCount: number;
}

export interface ChargingSpeedGroupDivisionCount {
  groups: Array<{
    groupName: string;
    minPowerKw: number;
    maxPowerKw: number;
    availableCount: number;
    totalCount: number;
  }>;
}

export interface LocationItem {
  locationId: string;
  locationStatus: string;
  name: string;
  cpoId: string;
  cpoName: string;
  latitude: number;
  longitude: number;
  roadAddress: string;
  address: string;
  addressDetail: string;
  chargingSpeedDivisionCount: ChargingSpeedDivisionCount[];
  chargingSpeedGroupDivisionCount: ChargingSpeedGroupDivisionCount;
  eventDiscountRate: number;
  distanceMeters: number;
  radiusMeters: number;
  publicOpenYn: boolean;
  parkingType: string;
  parkingFeeYn: boolean;
  qrScanYn: boolean;
  pncYn: boolean;
}

export interface LocationsData {
  content: LocationItem[];
  page: number;
  size: number;
  totalCount: number;
  totalPages: number;
  hasNext: boolean;
}

export type LocationsResponse = Response<LocationsData>;

const LOCATIONS_API_URL = "/v1/poi/app/locations";

export const locationsApi = async (params: LocationsRequest) => {
  const response = await apiRequest<LocationsResponse>(
    "post",
    LOCATIONS_API_URL,
    params,
  );

  return response.data;
};

export const locationsQueryFactory = {
  list: (params: LocationsRequest, enabled = true) =>
    queryOptions({
      queryKey: serviceKeys.stationSearch.locations(params),
      queryFn: () => locationsApi(params),
      enabled,
      placeholderData: (previousData) => previousData,
    }),
};

export const useGetLocationsQuery = (
  params: LocationsRequest,
  enabled = true,
) => {
  return useQuery(locationsQueryFactory.list(params, enabled));
};
