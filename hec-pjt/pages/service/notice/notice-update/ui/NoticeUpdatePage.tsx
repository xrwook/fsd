import type { FileItem } from '@hae-fe/pattern';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useParams } from 'react-router-dom';

import { useGetNoticeDetailQuery } from '@/entities/service/api/noticeDetail';
import { NoticeCreateBasicInfo } from '@/features/notice-form';
import { NoticeCreateExposureSettings } from '@/features/notice-form';
import { DEFAULT_VALUES, type NoticeFormValues } from '@/features/notice-form/model/noticeValues';
import { noticeValueSchema } from '@/features/notice-form/model/schema';
import { referenceType, SCREEN_ID } from '@/shared/config';
import { formatUtc } from '@/shared/lib/date';
import { useSystemModal } from '@/shared/lib/modal';
import { navigateToScreen } from '@/shared/lib/navigation/navigation';
import { useLeaveConfirm } from '@/shared/lib/router';
import { PageLayout } from '@/widgets/layout/ui';

import { useNoticeUpdateMutation } from '../api/noticeUpdate';

const NoticeUpdate = () => {
  const { id } = useParams();
  const skipRef = useRef(false);
  const { snackbar } = useSystemModal();
  const { data: detail } = useGetNoticeDetailQuery({
    path: { id: id ?? '' },
  });

  const {
    control,
    reset,
    handleSubmit,
    // trigger,
    formState: { isValid, isDirty },
  } = useForm<NoticeFormValues>({
    defaultValues: DEFAULT_VALUES,
    mode: 'onChange',
    resolver: zodResolver(noticeValueSchema),
  });

  useLeaveConfirm({ isDirty, skipRef });

  const { mutate } = useNoticeUpdateMutation();
  const [files, setFiles] = useState<FileItem[]>([]);

  useEffect(() => {
    if (!detail) return;
    const attachFile = detail?.attachFiles;
    const initFiles: FileItem[] = attachFile.flatMap(grp => {
      return (grp.files ?? []).map(file => ({
        id: file.fileDtlId,
        name: file.originalName,
        size: file.fileSize,
        status: 'idle',
      }));
    });

    const fileDtlIds = attachFile.flatMap(grp => (grp.files ?? []).map(file => Number(file.fileDtlId)));

    const fileId = detail.attachFileId || '';

    reset({
      noticeTypeCd: detail.noticeTypeCd,
      isImportant: detail.isImportant,
      title: detail.title,
      content: detail.content,
      publishType: detail.publishType,
      publishedAt: detail.publishedAt ? new Date(detail.publishedAt) : null,
      attachFileId: fileId,
      fileConfirm: {
        groups: [
          {
            fileId,
            referenceType: attachFile[0]?.referenceType ?? referenceType.PFMT_CS_NTC,
            fileDtlIds,
          },
        ],
      },
    });

    setFiles(initFiles);

    // void trigger();
  }, [detail, reset]);

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

  const onSubmit = handleSubmit(values => {
    mutate(
      {
        requestBody: {
          ...values,
          attachFileId: detail?.attachFileId || '',
          publishedAt: values.publishType === 'SCHEDULED' && values.publishedAt ? formatUtc(values.publishedAt) : null,
          fileConfirm: {
            groups: [
              {
                fileId: detail?.attachFileId || '',
                referenceType: referenceType.PFMT_CS_NTC,
                fileDtlIds: [],
              },
            ],
          },
          version: detail?.version || 0,
        },
        path: { id: id ?? '' },
      },
      {
        onSuccess: () => {
          snackbar({
            message: '수정이 완료되었습니다.',
          });
          skipRef.current = true;
          navigateToScreen(SCREEN_ID.PLATFORMMGT.PFMT_CS_NTC);
        },
      },
    );
  });

  return (
    <PageLayout
      title="공지사항 수정"
      headerButtonItems={[
        {
          label: '취소',
          variant: 'ghost',
          onClick: () => {
            navigateToScreen(SCREEN_ID.PLATFORMMGT.PFMT_CS_NTC);
          },
        },
        {
          label: '수정',
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

export default NoticeUpdate;
