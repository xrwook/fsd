import type { FileItem } from '@hae-fe/pattern';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRef, useState } from 'react';
import { useForm } from 'react-hook-form';

import { NoticeCreateBasicInfo } from '@/features/notice-form';
import { NoticeCreateExposureSettings } from '@/features/notice-form';
import { DEFAULT_VALUES, type NoticeFormValues } from '@/features/notice-form/model/noticeValues';
import { noticeValueSchema } from '@/features/notice-form/model/schema';
import { useFileGroupIdMutation } from '@/shared/api/common-file';
import { referenceType, SCREEN_ID } from '@/shared/config';
import { formatUtc } from '@/shared/lib/date';
import { useSystemModal } from '@/shared/lib/modal';
import { navigateToScreen } from '@/shared/lib/navigation/navigation';
import { useLeaveConfirm } from '@/shared/lib/router';
import { PageLayout } from '@/widgets/layout/ui';

import { useNoticeCreateMutation } from '../api/noticeCreate';

const NoticeCreate = () => {
  const { mutateAsync: attachFileId } = useFileGroupIdMutation();
  const { snackbar } = useSystemModal();
  const skipRef = useRef(false);
  const {
    control,
    handleSubmit,
    formState: { isValid, isDirty },
  } = useForm<NoticeFormValues>({
    defaultValues: DEFAULT_VALUES,
    mode: 'onSubmit',
    resolver: zodResolver(noticeValueSchema),
  });

  useLeaveConfirm({ isDirty, skipRef });
  const { mutate } = useNoticeCreateMutation();

  const [files, setFiles] = useState<FileItem[]>([]);

  const handleFilesSelected = (newFiles: File[]) => {
    const fileItems: FileItem[] = newFiles.map((file, index) => ({
      id: String(Date.now() + index),
      name: file.name,
      size: file.size,
      status: 'idle',
    }));

    setFiles(previous => [...previous, ...fileItems]);
  };

  const handleDeleteFile = (id: string) => {
    setFiles(previous => previous.filter(file => file.id !== id));
  };

  const totalSize = files.reduce((acc, file) => acc + (file.size ?? 0), 0);

  const onSubmit = handleSubmit(async values => {
    const fid = await attachFileId();
    if (!fid) {
      snackbar({ message: '파일 업로드에 실패했습니다' });
      return;
    }

    mutate(
      {
        requestBody: {
          ...values,
          attachFileId: fid || '',
          publishedAt: values.publishType === 'SCHEDULED' && values.publishedAt ? formatUtc(values.publishedAt) : null,
          fileConfirm: {
            groups: [
              {
                fileId: fid || '',
                referenceType: referenceType.PFMT_CS_NTC,
                fileDtlIds: [],
              },
            ],
          },
        },
      },
      {
        onSuccess: () => {
          snackbar({
            message: '등록이 완료되었습니다.',
          });
          skipRef.current = true;
          navigateToScreen(SCREEN_ID.PLATFORMMGT.PFMT_CS_NTC);
        },
      },
    );
  });

  return (
    <PageLayout
      title="공지사항 등록"
      headerButtonItems={[
        {
          label: '취소',
          variant: 'ghost',
          onClick: () => {
            navigateToScreen(SCREEN_ID.PLATFORMMGT.PFMT_CS_NTC);
          },
        },
        {
          label: '등록',
          variant: 'primary',
          onClick: onSubmit,
          disabled: !isValid,
        },
      ]}
    >
      <NoticeCreateBasicInfo
        control={control}
        files={files}
        totalSize={totalSize}
        onDeleteFile={handleDeleteFile}
        onFilesSelected={handleFilesSelected}
      />

      <NoticeCreateExposureSettings control={control} />
    </PageLayout>
  );
};

export default NoticeCreate;
