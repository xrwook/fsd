import { referenceType } from '@/shared/config';

export interface NoticeFormValues {
  noticeTypeCd: string;
  isImportant: boolean;
  title: string;
  content: string;
  publishType: string;
  publishedAt: Date | null;
  attachFileId: string;
  fileConfirm: FileConfirm;
}

export interface FileConfirm {
  groups: Group[];
}

export interface Group {
  fileId: string;
  referenceType: string;
  fileDtlIds: number[];
}

export const DEFAULT_VALUES: NoticeFormValues = {
  noticeTypeCd: '',
  isImportant: false,
  title: '',
  content: '',
  publishType: '',
  publishedAt: null,
  attachFileId: '',
  fileConfirm: {
    groups: [
      {
        fileId: '',
        referenceType: referenceType.PFMT_CS_NTC,
        fileDtlIds: [],
      },
    ],
  },
};
