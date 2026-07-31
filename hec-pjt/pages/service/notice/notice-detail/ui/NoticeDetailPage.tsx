import { useParams } from 'react-router-dom';

import { useGetNoticeDetailQuery } from '@/entities/service/api/noticeDetail';
import { SCREEN_ID } from '@/shared/config';
import { useSystemModal } from '@/shared/lib/modal';
import { navigateToScreen } from '@/shared/lib/navigation/navigation';
import { PageLayout } from '@/widgets/layout/ui';

import type { DeleteNoticeResponse } from '../api/noticeDelete';
import { useDeleteNoticeMutation } from '../api/noticeDelete';
import { NoticeDetailBasicInfo } from './_NoticeDetailBasicInfo';
import { NoticeDetailExposureSettings } from './_NoticeDetailExposureSettings';

const NoticeDetail = () => {
  const { id } = useParams();
  const { data: detail } = useGetNoticeDetailQuery({ path: { id: id ?? '' } });
  const { dangerConfirm, snackbar } = useSystemModal();
  const { mutate: deleteMutate } = useDeleteNoticeMutation();

  const onDeleteNoticeSuccess = (data: DeleteNoticeResponse) => {
    if (data.message === 'SUCCESSFULLY_DELETED') {
      navigateToScreen(SCREEN_ID.PLATFORMMGT.PFMT_CS_NTC);
      snackbar({ message: '삭제가 완료되었습니다.' });
    }
  };

  const onDelete = async () => {
    const path = { id: id ?? '' };
    const query = { version: detail?.version || 0 };
    if (!path.id) return;

    const result = await dangerConfirm({
      title: '삭제 확인',
      message: '삭제한 데이터는 복구할 수 없습니다. \n 삭제하시겠습니까?',
    });
    if (result) {
      deleteMutate(
        { path, query },
        {
          onSuccess: data => {
            onDeleteNoticeSuccess(data);
          },
        },
      );
    }
  };

  return (
    <PageLayout
      headerButtonItems={[
        {
          isDivider: true,
          label: '삭제',
          onClick: onDelete,
          variant: 'attention',
        },
        {
          label: '목록',
          onClick: () => navigateToScreen(SCREEN_ID.PLATFORMMGT.PFMT_CS_NTC),
          variant: 'ghost',
        },
        {
          label: '수정',
          onClick: () =>
            navigateToScreen(SCREEN_ID.PLATFORMMGT.PFMT_CS_NTC_UPDATE, {
              pathParams: {
                id: `${id}`,
              },
            }),
          variant: 'primary',
        },
      ]}
      title="공지사항 상세"
    >
      <NoticeDetailBasicInfo files={[]} data={detail} />
      <NoticeDetailExposureSettings data={detail} />
    </PageLayout>
  );
};

export default NoticeDetail;
