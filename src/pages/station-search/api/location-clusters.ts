import { queryOptions, useQuery } from "@tanstack/react-query";

import type { Request, Response } from "@/shared/lib/api";
import { apiRequest } from "@/shared/lib/api";
import { serviceKeys } from "@/shared/query-keys";

export type LocationClusterLevel = 1 | 2;

export interface LocationClustersRequestBody {
  level: LocationClusterLevel;
  minLatitude: number;
  maxLatitude: number;
  minLongitude: number;
  maxLongitude: number;
}

export type LocationClustersRequest = Request<{
  requestBody: LocationClustersRequestBody;
}>;

export interface LocationCluster {
  level: number;
  districtCode: string;
  districtCodeName: string;
  count: number;
  latitude: number;
  longitude: number;
}

export interface LocationCoordinate {
  locationId: string;
  latitude: number;
  longitude: number;
}

export interface LocationClustersData {
  ClusterList: LocationCluster[];
  locationCoordinates: LocationCoordinate[];
}

export type LocationClustersResponse = Response<LocationClustersData>;

const LOCATION_CLUSTERS_API_URL = "/v1/poi/app/locations/clusters";

export const locationClustersApi = async (params: LocationClustersRequest) => {
  const response = await apiRequest<LocationClustersResponse>(
    "get",
    LOCATION_CLUSTERS_API_URL,
    params,
  );

  return response.data;
};

export const locationClustersQueryFactory = {
  list: (params: LocationClustersRequest, enabled = true) =>
    queryOptions({
      queryKey: serviceKeys.stationSearch.locationClusters(params),
      queryFn: () => locationClustersApi(params),
      enabled,
      placeholderData: (previousData) => previousData,
    }),
};

export const useGetLocationClustersQuery = (
  params: LocationClustersRequest,
  enabled = true,
) => {
  return useQuery(locationClustersQueryFactory.list(params, enabled));
};
