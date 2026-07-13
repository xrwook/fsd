import type { GridOptions, Module } from "ag-grid-community";
import { useMemo } from "react";

import { DataTable, type DataTableProps } from "@/shared/ui/DataTable";

import { createAgGridOptions } from "../config/defaultGridOptions";
import { mergeAgGridModules } from "../config/modules";

export type AgGridProps<TData> = Omit<
  DataTableProps<TData>,
  "gridProps" | "modules"
> & {
  gridProps?: GridOptions<TData>;
  modules?: Module[];
  syncNoRowsOverlayOnFilter?: boolean;
};

export const AgGrid = <TData,>({
  gridProps,
  modules,
  rowBorder = true,
  size = "small",
  syncNoRowsOverlayOnFilter = true,
  vertical = true,
  ...dataTableProps
}: AgGridProps<TData>) => {
  const mergedModules = useMemo(() => mergeAgGridModules(modules), [modules]);
  const mergedGridProps = useMemo<GridOptions<TData>>(
    () =>
      createAgGridOptions({
        gridProps,
        syncNoRowsOverlayOnFilter,
      }),
    [gridProps, syncNoRowsOverlayOnFilter],
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
