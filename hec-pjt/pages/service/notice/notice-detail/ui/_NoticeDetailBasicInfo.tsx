import { Divider, TextBadge, Typography } from '@hae-fe/elements';
import { FileDownload, type FileItem, Form, FormField, FormFieldRow } from '@hae-fe/pattern';

import type { NoticeDetailData } from '@/entities/service/model/noticeDetailSchema';
import { AreaHeader } from '@/shared/ui/area-header';
import { TiptapViewer } from '@/shared/ui/editor/ui/TiptapViewer';

// import { data } from '../model';

type Props = {
  files: FileItem[];
  data?: NoticeDetailData;
};

export const NoticeDetailBasicInfo = ({ data, files }: Props) => {
  const isImportant = !!data?.isImportant;
  return (
    <>
      <AreaHeader title="기본 정보" />
      <div className="mb-12 flex flex-col gap-2">
        <Form labelWidth={200}>
          <FormFieldRow className="mb-2" cols={1} style={{ gap: '8px' }}>
            <FormField
              controller={
                <div className="flex flex-row items-center">
                  <Typography
                    className="flex flex-row items-center leading-9 text-(--color-text-neutral-stronger)"
                    hdsProps={{ size: '15', type: 'body', weight: 'regular' }}
                  >
                    {data?.title}
                    {isImportant && (
                      <div className="px-3">
                        <Divider className="min-h-3.75" orientation="vertical" />
                      </div>
                    )}
                  </Typography>
                  {isImportant && (
                    <TextBadge
                      badgeContent={'중요'}
                      className="inline-block"
                      expressive
                      size="small"
                      styleOption="fill"
                    />
                  )}
                </div>
              }
              label="제목"
            />
            <Form labelWidth={200}>
              <FormFieldRow cols={1}>
                <FormField
                  controller={
                    <Typography
                      className="leading-9 text-(--color-text-neutral-stronger)"
                      hdsProps={{
                        size: '15',
                        type: 'body',
                        weight: 'regular',
                      }}
                    >
                      {/* {data?.content} */}
                      <TiptapViewer value={data.content} />
                    </Typography>
                  }
                  label="내용"
                  style={{ alignItems: 'start', flexDirection: 'row' }}
                />
                <FormField
                  controller={<FileDownload files={files} title="파일 첨부" variant="full" />}
                  label="첨부 파일"
                  style={{ alignItems: 'start' }}
                />
              </FormFieldRow>
            </Form>
          </FormFieldRow>
        </Form>
      </div>
    </>
  );
};
