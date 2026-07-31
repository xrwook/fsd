import type { ColDef } from "ag-grid-community";

import { formatDateTime } from "@/shared/lib/date";

import { StausBadgeRenderer } from "./stausBadgeRenderer";
import type { FaqListItem } from "./faqList";

// list page
export const COLUMN_DEFS: ColDef<FaqListItem>[] = [
  {
    field: "question",
    headerName: "제목",
    minWidth: 500,
    maxWidth: 900,
    flex: 2,
    cellRenderer: StausBadgeRenderer,
    cellRendererParams: {
      mode: "textBadge",
      badgeField: "isTop10",
      badgeText: "TOP 10",
      textField: "question",
    },
  },
  { field: "faqCategoryName", headerName: "카테고리", width: 160 },
  {
    field: "publishType",
    headerName: "게시 상태",
    width: 84,
    cellRenderer: StausBadgeRenderer,
    cellRendererParams: {
      mode: "badge",
    },
  },
  {
    field: "publishedAt",
    headerName: "게시일",
    minWidth: 160,
    flex: 1,
    valueFormatter: ({ value }: { value: string | Date | null }) =>
      formatDateTime(value),
  },
  { field: "modifiedByName", headerName: "수정자", width: 100 },
  {
    field: "modifiedDate",
    headerName: "최근 수정일",
    width: 184,
    valueFormatter: ({ value }: { value: string | Date | null }) =>
      formatDateTime(value),
  },
];
