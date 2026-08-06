import type { ColDef } from "ag-grid-community";

import { TERM_REQUIRED_LABEL } from "@/features/term-form/model/constant";
import { formatDateTime } from "@/shared/lib/date";

import { GridTextInputRenderer } from "../../../../../shared/ui/ag-grid";
import { TermStatusBadgeRenderer } from "../ui/_TermStatusBadgeRenderer";
import { TermTypeDeleteButtonRenderer } from "./termTypeDeleteButtonRenderer";
import type { TermTypeRow, TermVersionListItem } from "./termsList";

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

export const TERM_TYPE_COLUMN_DEFS: ColDef<TermTypeRow>[] = [
  {
    headerName: "",
    width: 29,
    rowDrag: true,
    suppressMovable: true,
    sortable: false,
    filter: false,
    resizable: false,
  },
  {
    field: "termName",
    headerName: "약관 종류",
    minWidth: 240,
    flex: 1,
    sortable: false,
    filter: false,
    resizable: false,
    cellRenderer: GridTextInputRenderer,
    cellRendererParams: {
      fieldName: "termName",
      errorFieldName: "termNameError",
      placeholder: "약관 종류를 입력해 주세요.",
      onChangeContextName: "onTermTypeChange",
    },
    cellClass: "inputCell",
  },
  {
    field: "termCode",
    headerName: "약관 코드",
    minWidth: 240,
    flex: 1,
    sortable: false,
    filter: false,
    resizable: false,
    cellRenderer: GridTextInputRenderer,
    cellRendererParams: {
      fieldName: "termCode",
      errorFieldName: "termCodeError",
      placeholder: "약관 코드를 입력해 주세요.",
      disabled: (data: TermTypeRow) => !!data.readOnlyCode,
      onChangeContextName: "onTermTypeChange",
    },
    cellClass: "inputCell",
  },
  {
    headerName: "",
    width: 44,
    sortable: false,
    filter: false,
    resizable: false,
    cellRenderer: TermTypeDeleteButtonRenderer,
    cellClass: "deleteCell",
  },
];

export const TermTypeRowClassRules = {
  rowInvalid: (params: any) =>
    !!params.data?.termCodeError || !!params.data?.termNameError,
};
