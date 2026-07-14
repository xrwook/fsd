import type { GridOptions, Module } from "ag-grid-community";
import { useMemo } from "react";

import { DataTable, type DataTableProps } from "@/shared/ui/DataTable";

import {
  type AgGridOptions,
  createAgGridOptions,
} from "../config/defaultGridOptions";
import { mergeAgGridModules } from "../config/modules";

export type AgGridProps<TData> = Omit<
  DataTableProps,
  "gridProps" | "modules"
> & {
  gridProps?: AgGridOptions<TData>;
  modules?: Module[];
  syncNoRowsOverlayOnFilter?: boolean;
};

/**
 * 앱에서 직접 사용하는 AG Grid 공통 컴포넌트.
 * 하위 DataTable은 @hae-fe/pattern의 DataTable 역할만 하고,
 * row 타입 추론과 프로젝트 기본 옵션은 이 wrapper에서 책임진다.
 */
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
    <DataTable
      {...dataTableProps}
      gridProps={mergedGridProps}
      modules={mergedModules}
      rowBorder={rowBorder}
      size={size}
      vertical={vertical}
    />
  );
};
