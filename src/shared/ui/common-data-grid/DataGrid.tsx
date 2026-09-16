import { DataTable } from '@hae-fe/pattern';
import type { AgColumn, ColGroupDef } from 'ag-grid-community';
import { type ColDef, type GridOptions, type ITooltipParams } from 'ag-grid-community';
import type { RowClickedEvent } from 'ag-grid-enterprise';
import { useCallback, useEffect, useMemo, useState } from 'react';

import { formatEmptyValue } from '@/shared/lib/format/formatEmptyValue';
import { cn } from '@/shared/lib/tailwind';
import { DataGridLoading } from '@/shared/ui/common-data-grid/_DataGridLoading';
import DataGridPagination, { type Props as PaginationProps } from '@/shared/ui/common-data-grid/_DataGridPagination';

import { DataGridEmpty, DataGridEmptyError, DataGridEmptyFilter } from './_DataGridEmpty';
import { useEmptyPageFallback } from './useEmptyPageFallback';

type Props<TData extends object> = {
  className?: string;
  gridClassName?: string;
  useGridTableClass?: boolean;
  gridProps: Omit<
    GridOptions<TData>,
    | 'columnDefs'
    | 'loadingOverlayComponent'
    | 'rowData'
    | 'suppressCellFocus'
    | 'suppressContextMenu'
    | 'tooltipShowDelay'
    | 'tooltipValueGetter'
  > & {
    isError?: boolean;
    isFiltering?: boolean;
    /** 재조회 중 빈 데이터로 인한 자동 페이지 이동을 방지합니다. */
    isFetching?: boolean;
    rowData?: TData[];
    columnDefs: NonNullable<GridOptions<TData>['columnDefs']>;
    defaultColDef?: GridOptions<TData>['defaultColDef'];
    maxVisibleRows?: number; //스크롤 없이 최대 보여줄 행의 수
    designType?: 'medium' | 'small';
  };
  vertical?: boolean;
  pagination?: PaginationProps;
};

//scroll 적용 기준
const DEFAULT_MAX_VISIBLE_ROWS = 15;
const SMALL_ROW_HEIGHT = 40;
const MEDIUM_ROW_HEIGHT = 48;

const DataGrid = <TData extends object>({
  className,
  gridClassName,
  useGridTableClass = true,
  gridProps: {
    isError,
    isFiltering,
    isFetching,
    rowData,
    columnDefs,
    noRowsOverlayComponent,
    domLayout = 'autoHeight',
    defaultColDef,
    onRowClicked,
    headerHeight,
    rowHeight,
    designType = 'small',
    maxVisibleRows = DEFAULT_MAX_VISIBLE_ROWS,
    ...restGridProps
  },
  vertical = false,
  pagination,
}: Props<TData>) => {
  useEmptyPageFallback({
    rowData,
    loading: restGridProps.loading,
    isFetching,
    isError,
    page: pagination?.page,
    onChangePage: pagination?.onChangePage,
  });

  const [customColumnDefs, setCustomColumnDefs] = useState<GridOptions<TData>['columnDefs']>([]);
  const isScroll = useMemo(
    () => domLayout === 'autoHeight' && (rowData?.length ?? 0) > maxVisibleRows,
    [domLayout, rowData?.length, maxVisibleRows],
  );
  //scroll 인경우 강제 normal로
  const computedDomLayout = useMemo(() => (isScroll ? 'normal' : domLayout), [isScroll, domLayout]);
  const computedHeaderHeight = useMemo(() => {
    if (headerHeight !== undefined) {
      return headerHeight;
    } else if (designType === 'small') {
      return SMALL_ROW_HEIGHT;
    } else if (designType === 'medium') {
      return MEDIUM_ROW_HEIGHT;
    }
  }, [headerHeight, designType]);
  const computedRowHeight = useMemo(() => {
    if (rowHeight !== undefined) {
      return rowHeight;
    } else if (designType === 'small') {
      return SMALL_ROW_HEIGHT;
    } else if (designType === 'medium') {
      return MEDIUM_ROW_HEIGHT;
    }
  }, [rowHeight, designType]);
  const height = useMemo(() => {
    return maxVisibleRows * (computedRowHeight ?? 0) + (computedHeaderHeight ?? 0);
  }, [maxVisibleRows, computedHeaderHeight, computedRowHeight]); //header 높이도 계산해야됨

  const handleRowClicked = useCallback((event: RowClickedEvent<TData>) => {
    //suppressMouseEventHandling 적용시 rowEvent 발생하지 않도록
    if (event.isEventHandlingSuppressed) return;
    onRowClicked?.(event);
  }, []);

  // 우선순위: Error > Filtering > Custom > Empty
  const NoRowsOverlayComponent = useMemo(() => {
    if (isError) {
      return DataGridEmptyError;
    }
    if (isFiltering) {
      return DataGridEmptyFilter;
    }
    if (noRowsOverlayComponent) {
      return noRowsOverlayComponent;
    }
    return DataGridEmpty;
  }, [isError, isFiltering, noRowsOverlayComponent]);

  const getFlex = (column: ColDef<TData>) => {
    if (typeof column.flex === 'number') {
      return column.flex;
    } else if (typeof column.width !== 'number') {
      return 1;
    }
    return null;
  };

  const tooltipValueGetter = ({ valueFormatted, column }: ITooltipParams) => {
    if ((column as AgColumn).userProvidedColDef) {
      return (column as AgColumn).userProvidedColDef?.cellRenderer ||
        (column as AgColumn).userProvidedColDef?.cellRendererSelector
        ? undefined
        : valueFormatted;
    }
  };

  const createColumnDefs = useCallback(
    (columns: (ColDef<TData> | ColGroupDef<TData>)[]): (ColDef<TData> | ColGroupDef<TData>)[] => {
      return columns.map(column => {
        if ('children' in column && Array.isArray(column.children) && column.children.length > 0) {
          return {
            ...(column as ColDef<TData>),
            children: createColumnDefs(column.children),
          };
        }

        return {
          ...column,
          headerTooltip: column.headerName,
          flex: getFlex(column),
        };
      });
    },
    [],
  );

  useEffect(() => {
    setCustomColumnDefs(createColumnDefs(columnDefs));
  }, [columnDefs]);

  return (
    <div className={cn('h-full w-full', className)} style={isScroll ? { height, flex: 'none' } : {}}>
      <DataTable
        className={cn('h-full w-full', useGridTableClass && 'gridTable', gridClassName)}
        vertical={vertical}
        gridProps={{
          rowData: rowData ?? [],
          domLayout: computedDomLayout,
          noRowsOverlayComponent: NoRowsOverlayComponent,
          loadingOverlayComponent: DataGridLoading,
          defaultColDef: {
            tooltipValueGetter,
            sortable: true, // column sorting 옵션
            suppressMovable: true,
            ...defaultColDef,
            valueFormatter: ({ value }) => formatEmptyValue(value),
            // 현재 출력된 데이터에서만 정렬
            // comparator: () => 0,
          },
          ...restGridProps,
          headerHeight: computedHeaderHeight,
          rowHeight: computedRowHeight,
          columnDefs: customColumnDefs,
          suppressContextMenu: true, //우측 마우스 기능
          suppressCellFocus: true, //셀 focus 사용여부
          onRowClicked: onRowClicked ? handleRowClicked : undefined,
          tooltipShowDelay: 100,
        }}
      />
      {pagination && <DataGridPagination {...pagination} />}
    </div>
  );
};

export default DataGrid;
