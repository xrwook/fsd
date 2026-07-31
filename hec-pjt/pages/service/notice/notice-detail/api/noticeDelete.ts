import { useMutation, useQueryClient } from '@tanstack/react-query';

import type { Request, Response } from '@/shared/lib/api';
import { apiRequest } from '@/shared/lib/api';
import { serviceKeys } from '@/shared/query-keys';

type DeleteNoticeRequest = Request<{ path: { id: string }; query: { version: number } }>;
export type DeleteNoticeResponse = Response<{ result: string }>;

const deleteNoticeApi = async (request: DeleteNoticeRequest) => {
  const response = await apiRequest<DeleteNoticeResponse>('delete', '/pfmt/notice/notices/{id}', request);
  return response.data;
};

export const useDeleteNoticeMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: DeleteNoticeRequest) => deleteNoticeApi(request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: serviceKeys.notice.list() });
    },
  });
};
