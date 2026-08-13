import {
  queryOptions,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import { apiRequest, type Request, type Response } from "@/shared/lib/api";
import { serviceKeys } from "@/shared/query-keys";

import type {
  HomeMenuVisitItem,
  HomeNoticeDetail,
  HomeNoticeListItem,
  HomePageableQuery,
  HomePageData,
} from "../model";

export type HomePageableRequest = Request<{
  query: HomePageableQuery;
}>;

export type HomeRecentVisitsResponse = Response<
  HomePageData<HomeMenuVisitItem>
>;

export type HomeNoticesResponse = Response<HomePageData<HomeNoticeListItem>>;

export type HomeNoticeDetailRequest = Request<{
  path: {
    id: string;
  };
}>;

export type HomeNoticeDetailResponse = Response<HomeNoticeDetail>;

export type CreateHomeRecentVisitResponse = Response<string>;

export type UpdateHomeFavoriteRequest = Request<{
  path: {
    screenId: string;
  };
  requestBody: {
    isFavorite: boolean;
  };
}>;

export type UpdateHomeFavoriteResponse = Response<string>;

export const getHomeRecentVisits = async (params: HomePageableRequest) => {
  const response = await apiRequest<HomeRecentVisitsResponse>(
    "get",
    "/v1/backoffice/home/main/recent-visits",
    params,
  );
  return response.data;
};

export const getHomeNotices = async (params: HomePageableRequest) => {
  const response = await apiRequest<HomeNoticesResponse>(
    "get",
    "/v1/backoffice/home/main/notices",
    params,
  );
  return response.data;
};

export const getHomeNoticeDetail = async (params: HomeNoticeDetailRequest) => {
  const response = await apiRequest<HomeNoticeDetailResponse>(
    "get",
    "/v1/backoffice/home/main/notices/{id}",
    params,
  );
  return response.data;
};

export const createHomeRecentVisit = async (screenId: string) => {
  const response = await apiRequest<CreateHomeRecentVisitResponse>(
    "post",
    "/v1/backoffice/home/main/recent-visits",
    undefined,
    { screenId },
  );
  return response.data;
};

export const getHomeFavorites = async (params: HomePageableRequest) => {
  const response = await apiRequest<HomeRecentVisitsResponse>(
    "get",
    "/v1/backoffice/home/main/favorites",
    params,
  );
  return response.data;
};

export const updateHomeFavorite = async (params: UpdateHomeFavoriteRequest) => {
  const response = await apiRequest<UpdateHomeFavoriteResponse>(
    "put",
    "/v1/backoffice/home/main/favorites/{screenId}",
    params,
  );
  return response.data;
};

export const homeMainQueryFactory = {
  recentVisits: (params: HomePageableRequest, enabled = true) =>
    queryOptions({
      queryKey: serviceKeys.home.recentVisits(params),
      queryFn: () => getHomeRecentVisits(params),
      enabled,
    }),
  notices: (params: HomePageableRequest, enabled = true) =>
    queryOptions({
      queryKey: serviceKeys.home.notices(params),
      queryFn: () => getHomeNotices(params),
      enabled,
    }),
  noticeDetail: (params: HomeNoticeDetailRequest, enabled = true) =>
    queryOptions({
      queryKey: serviceKeys.home.noticeDetail(params.path.id),
      queryFn: () => getHomeNoticeDetail(params),
      enabled,
    }),
  favorites: (params: HomePageableRequest, enabled = true) =>
    queryOptions({
      queryKey: serviceKeys.home.favorites(params),
      queryFn: () => getHomeFavorites(params),
      enabled,
    }),
};

export const useGetHomeRecentVisitsQuery = (
  params: HomePageableRequest,
  enabled = true,
) => {
  return useQuery(homeMainQueryFactory.recentVisits(params, enabled));
};

export const useGetHomeNoticesQuery = (
  params: HomePageableRequest,
  enabled = true,
) => {
  return useQuery(homeMainQueryFactory.notices(params, enabled));
};

export const useGetHomeNoticeDetailQuery = (
  params: HomeNoticeDetailRequest,
  enabled = true,
) => {
  return useQuery(homeMainQueryFactory.noticeDetail(params, enabled));
};

export const useGetHomeFavoritesQuery = (
  params: HomePageableRequest,
  enabled = true,
) => {
  return useQuery(homeMainQueryFactory.favorites(params, enabled));
};

export const useCreateHomeRecentVisitMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (screenId: string) => createHomeRecentVisit(screenId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: serviceKeys.home.all(),
      });
    },
  });
};

export const useUpdateHomeFavoriteMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: UpdateHomeFavoriteRequest) =>
      updateHomeFavorite(params),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: serviceKeys.home.all() });
    },
  });
};
