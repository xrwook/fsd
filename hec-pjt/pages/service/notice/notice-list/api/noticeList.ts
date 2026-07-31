import { useQuery } from '@tanstack/react-query';

import { apiRequest, type PagingRequest, type PagingResponse } from '@/shared/lib/api';
import { serviceKeys } from '@/shared/query-keys';

import type { NoticeListItem } from '../model/noticeList';

export type NoticeListRequest = PagingRequest<{
  query: {
    searchKeyword?: string;
    searchNoticeTypeCd?: string;
    searchPublishType?: string;
    searchStartPublishedAt?: string;
    searchEndPublishedAt?: string;
    page?: number;
    size?: number;
  };
}>;

export type NoticeListResponse = PagingResponse<NoticeListItem>;

export const getNoticeList = async (params: NoticeListRequest) => {
  const response = await apiRequest<NoticeListResponse>('get', '/pfmt/notice/notices', params);
  return response.data;
};

export const useGetNoticeListQuery = (params: NoticeListRequest) => {
  return useQuery({
    queryKey: serviceKeys.notice.list(params),
    queryFn: () => getNoticeList(params),
  });
};
