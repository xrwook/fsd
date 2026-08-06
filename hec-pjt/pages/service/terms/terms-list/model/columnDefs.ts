import type { ColDef } from "ag-grid-community";

import { TERM_REQUIRED_LABEL } from "@/features/term-form/model/constant";
import { formatDateTime } from "@/shared/lib/date";

import { TermStatusBadgeRenderer } from "../ui/_TermStatusBadgeRenderer";
import type { TermVersionListItem } from "./termsList";

const getDeployDate = (item?: TermVersionListItem) => {
  if (!item) return null;

  return item.reservedAt || item.deployStartAt;
};

export const COLUMN_DEFS: ColDef<TermVersionListItem>[] = [
  { field: "ver", headerName: "버전", width: 120 },
  {
    field: "isRequired",
    headerName: "동의 구분",
    width: 120,
    valueFormatter: ({ value }: { value: boolean }) =>
      TERM_REQUIRED_LABEL[String(value) as keyof typeof TERM_REQUIRED_LABEL] ??
      "-",
  },
  {
    field: "deployStatus",
    headerName: "게시 상태",
    width: 120,
    cellRenderer: TermStatusBadgeRenderer,
  },
  {
    field: "revisionReason",
    headerName: "개정 사유",
    minWidth: 360,
    flex: 1,
  },
  {
    colId: "deployDate",
    headerName: "게시일시",
    width: 184,
    valueGetter: ({ data }) => getDeployDate(data),
    valueFormatter: ({ value }: { value: string | Date | null }) =>
      formatDateTime(value),
  },
  { field: "modifiedByName", headerName: "수정자", width: 120 },
  {
    field: "modifiedDate",
    headerName: "최근 수정일",
    width: 184,
    valueFormatter: ({ value }: { value: string | Date | null }) =>
      formatDateTime(value),
  },
];
