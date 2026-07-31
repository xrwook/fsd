import type { ColDef } from 'ag-grid-community';

import { formatDateTime } from '@/shared/lib/date';

import { StatusBadgeRenderer } from '../ui/_StatusBadgeRenderer';
import type { NoticeListItem } from './noticeList';

export const COLUMN_DEFS: ColDef<NoticeListItem>[] = [
  {
    field: 'title',
    headerName: '제목',
    minWidth: 500,
    maxWidth: 900,
    flex: 2,
    cellRenderer: StatusBadgeRenderer,
    cellRendererParams: {
      // mode?: 'badge' | 'badgeWithText' | 'text' | 'textBadge';
      mode: 'textBadge',
      badgeField: 'isImportant',
      badgeText: '중요',
      textField: 'title',
    },
  },
  { field: 'noticeTypeCdName', headerName: '공지 유형', width: 128 },
  {
    field: 'publishStatus',
    headerName: '게시 상태',
    width: 84,
    cellRenderer: StatusBadgeRenderer,
    cellRendererParams: {
      mode: 'badge',
    },
  },
  {
    field: 'publishedAt',
    headerName: '게시일',
    minWidth: 160,
    flex: 1,
    valueFormatter: ({ value }: { value: string | Date | null }) => formatDateTime(value),
  },
  { field: 'modifiedByName', headerName: '수정자', width: 100 },
  {
    field: 'modifiedDate',
    headerName: '최근 수정일',
    width: 184,
    valueFormatter: ({ value }: { value: string | Date | null }) => formatDateTime(value),
  },
];
