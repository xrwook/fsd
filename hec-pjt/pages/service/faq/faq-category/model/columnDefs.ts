import type { ColDef } from "ag-grid-community";

import { DeleteButtonRenderer } from "./deleteButtonRenderer";
import { NameInputRenderer } from "./nameInputRenderer";

export interface CategoryRow {
  id: number | string;
  category: string;
  fixedType?: string;
  faqCount?: number;
  isDeleted?: boolean;
  readOnly?: boolean;
  version?: number;
}

export const POPUP_COLUMN_DEFS: ColDef<CategoryRow>[] = [
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
    field: "category",
    headerName: "카테고리",
    flex: 1,
    sortable: false,
    filter: false,
    resizable: false,
    cellRenderer: NameInputRenderer,
    cellClass: "inputCell",
  },
  {
    headerName: "",
    width: 44,
    sortable: false,
    filter: false,
    resizable: false,
    cellRenderer: DeleteButtonRenderer,
    cellClass: "deleteCell",
  },
];

export const CategoryRowClassRules = {
  rowReadOnly: (params: any) => !!params.data?.readOnly,
};
