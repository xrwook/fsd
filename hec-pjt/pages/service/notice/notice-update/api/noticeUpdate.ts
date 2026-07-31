import { useMutation, useQueryClient } from '@tanstack/react-query';

import type { NoticeValuesSchema } from '@/features/notice-form/model/schema';
import type { Request, Response } from '@/shared/lib/api';
import { apiRequest } from '@/shared/lib/api';
import { serviceKeys } from '@/shared/query-keys';

export type noticeCreateType = Omit<NoticeValuesSchema, 'publishedAt'> & {
  publishedAt: string | null;
};

export type noticeCreateRequest = Request<{
  requestBody: noticeCreateType;
  path: { id: string };
}>;

export const noticeUpdateApi = async (params: noticeCreateRequest) => {
  const response = await apiRequest<Response<null>>('put', '/pfmt/notice/notices/{id}', params);
  return response.data;
};

export const useNoticeUpdateMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (params: noticeCreateRequest) => noticeUpdateApi(params),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: serviceKeys.notice.all() });
    },
  });
};
