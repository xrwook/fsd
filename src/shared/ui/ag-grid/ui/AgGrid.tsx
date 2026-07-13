import type { ColDef, GridOptions, Module } from "ag-grid-community";
import { useMemo } from "react";

import { DataTable, type DataTableProps } from "@/shared/ui/DataTable";

import { mergeAgGridModules } from "../config/modules";

const DEFAULT_LOADING_TEMPLATE =
  '<span class="sharedDataTable__overlay">조회하고 있습니다.</span>';
const DEFAULT_NO_ROWS_TEMPLATE =
  '<span class="sharedDataTable__overlay">조회 결과가 없습니다.</span>';

const getDefaultColDef = <TData,>(): ColDef<TData> => ({
  filter: true,
  flex: 1,
  minWidth: 120,
  resizable: true,
  sortable: true,
});

export type AgGridProps<TData> = Omit<
  DataTableProps<TData>,
  "gridProps" | "modules"
> & {
  gridProps?: GridOptions<TData>;
  modules?: Module[];
};

export const AgGrid = <TData,>({
  gridProps,
  modules,
  rowBorder = true,
  size = "small",
  vertical = true,
  ...dataTableProps
}: AgGridProps<TData>) => {
  const mergedModules = useMemo(() => mergeAgGridModules(modules), [modules]);
  const mergedGridProps = useMemo<GridOptions<TData>>(
    () => ({
      animateRows: true,
      overlayLoadingTemplate: DEFAULT_LOADING_TEMPLATE,
      overlayNoRowsTemplate: DEFAULT_NO_ROWS_TEMPLATE,
      ...gridProps,
      defaultColDef: {
        ...getDefaultColDef<TData>(),
        ...gridProps?.defaultColDef,
      },
    }),
    [gridProps],
  );

  return (
    <DataTable<TData>
      {...dataTableProps}
      gridProps={mergedGridProps}
      modules={mergedModules}
      rowBorder={rowBorder}
      size={size}
      vertical={vertical}
    />
  );
};
