import { Checkbox, RadioButton, RadioGroup, TextField } from '@hae-fe/elements';
import {
  type FileItem,
  FileListItem,
  FileSelectorArea,
  FileTitle,
  Form,
  FormField,
  FormFieldRow,
} from '@hae-fe/pattern';
import { type Control, Controller } from 'react-hook-form';

import { useGetCommonCodesQuery } from '@/shared/api/common-code';
import { AreaHeader } from '@/shared/ui/area-header';
import { TiptapEditor } from '@/shared/ui/editor';

import type { NoticeFormValues } from '../model/noticeValues';

type Props = {
  control: Control<NoticeFormValues>;
  files: FileItem[];
  onDeleteFile: (id: string) => void;
  onFilesSelected: (files: File[]) => void;
  totalSize: number;
};

export const NoticeCreateBasicInfo = ({ control, files, onDeleteFile, onFilesSelected, totalSize }: Props) => {
  const { data: NOTICE_TYPE = [] } = useGetCommonCodesQuery('NOTICE_TYPE');
  return (
    <>
      <AreaHeader title="기본 정보" />

      <div className="mb-12 flex flex-col gap-2">
        <Form labelWidth={200}>
          <FormFieldRow className="mb-2" cols={1} style={{ gap: '8px' }}>
            <FormField
              label="공지 유형"
              required
              controller={
                <div className="flex flex-col gap-2">
                  <Controller
                    name="noticeTypeCd"
                    control={control}
                    render={({ field }) => (
                      <RadioGroup
                        className="h-9 items-center"
                        direction="horizontal"
                        value={field.value}
                        onChange={e => field.onChange(e.target.value)}
                        size="medium"
                      >
                        {NOTICE_TYPE.map(x => {
                          const value = `${x.value}`;
                          return <RadioButton key={value} id={value} value={value} label={x.label} size="medium" />;
                        })}

                        <Controller
                          name="isImportant"
                          control={control}
                          render={({ field }) => (
                            <Checkbox
                              checked={field.value}
                              label="중요 공지"
                              size="medium"
                              onChange={e => field.onChange(e.target.checked)}
                            />
                          )}
                        />
                      </RadioGroup>
                    )}
                  />
                </div>
              }
            />

            <FormField
              label="제목"
              required
              controller={
                <Controller
                  name="title"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      placeholder="제목을 입력해 주세요."
                      value={field.value}
                      onChange={e => field.onChange(e.target.value)}
                    />
                  )}
                />
              }
            />

            <FormField
              label="내용"
              required
              style={{ alignItems: 'start' }}
              controller={
                <Controller
                  name="content"
                  control={control}
                  render={({ field }) => <TiptapEditor value={field.value} onChange={field.onChange} />}
                />
              }
            />

            <FormField
              label="첨부 파일"
              style={{ alignItems: 'start' }}
              controller={
                <div className="flex flex-col gap-2">
                  <FileTitle fileCount={files.length} fileSizeBytes={totalSize} variant="upload" />

                  <div>
                    <div className="overflow-hidden border border-b-0 border-(--color-light-action-border-neutral-weaker) py-2">
                      {files.map(file => (
                        <FileListItem
                          key={file.id}
                          fileItem={file}
                          layout="list"
                          onDelete={() => onDeleteFile(file.id)}
                        />
                      ))}
                    </div>

                    <FileSelectorArea onFilesSelected={onFilesSelected} subText="00MB 이하" />
                  </div>
                </div>
              }
            />
          </FormFieldRow>
        </Form>
      </div>
    </>
  );
};
