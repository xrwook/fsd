import type { ColDef, RowClassParams } from "ag-grid-community";

import { GridTextInputRenderer } from "../../../../../shared/ui/ag-grid";
import { DeleteButtonRenderer } from "./deleteButtonRenderer";

export interface CategoryRow {
  id: number | string;
  category: string;
  categoryError?: string;
  isError?: boolean;
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
    cellRenderer: GridTextInputRenderer,
    cellRendererParams: {
      fieldName: "category",
      errorFieldName: "categoryError",
      isErrorFieldName: "isError",
      placeholder: "카테고리명을 입력하세요",
      disabled: (data: CategoryRow) => !!data.readOnly,
      onChangeContextName: "onCategoryChange",
    },
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
  rowInvalid: (params: RowClassParams<CategoryRow>) => !!params.data?.isError,
  rowReadOnly: (params: RowClassParams<CategoryRow>) =>
    !!params.data?.readOnly,
};
