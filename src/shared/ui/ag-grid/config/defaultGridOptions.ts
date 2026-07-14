import type {
  ColDef,
  FilterChangedEvent,
  GridOptions,
  RowClickedEvent,
  RowDoubleClickedEvent,
} from "ag-grid-community";

/**
 * 화면에서는 row event보다 row data를 바로 쓰는 경우가 많아서
 * 공통 wrapper에서는 data를 첫 번째 인자로 넘기는 형태로 제공한다.
 */
export type AgGridRowClickedHandler<TData> = (
  data: TData,
  event: RowClickedEvent<TData>,
) => void;

export type AgGridRowDoubleClickedHandler<TData> = (
  data: TData,
  event: RowDoubleClickedEvent<TData>,
) => void;

/**
 * AG Grid 원본 GridOptions를 대부분 그대로 열어두되,
 * row click 계열 이벤트만 data-first handler로 재정의한다.
 */
export type AgGridOptions<TData> = Omit<
  GridOptions<TData>,
  "onRowClicked" | "onRowDoubleClicked"
> & {
  onRowClicked?: AgGridRowClickedHandler<TData>;
  onRowDoubleClicked?: AgGridRowDoubleClickedHandler<TData>;
};

export const DEFAULT_AG_GRID_LOADING_TEMPLATE =
  '<span class="sharedDataTable__overlay">조회하고 있습니다.</span>';

export const DEFAULT_AG_GRID_NO_ROWS_TEMPLATE =
  '<span class="sharedDataTable__overlay">조회 결과가 없습니다.</span>';

/** 목록 화면에서 반복되는 기본 컬럼 동작. 화면별 설정이 있으면 해당 값이 우선된다. */
export const getDefaultAgGridColDef = <TData>(): ColDef<TData> => ({
  flex: 1,
  minWidth: 120,
  resizable: true,
  sortable: false,
});

/** DataTable을 사용하는 일반 목록 화면에 공통으로 적용할 grid 기본 옵션. */
export const getDefaultAgGridOptions = <TData>(): GridOptions<TData> => ({
  animateRows: true,
  domLayout: "autoHeight",
  suppressCellFocus: true,
  suppressRowClickSelection: true,
});

const getDefaultAgGridOverlayOptions = <TData>(
  gridProps?: AgGridOptions<TData>,
): GridOptions<TData> => {
  // 화면에서 overlay component/template을 직접 지정하면 기본 template은 주입하지 않는다.
  const hasLoadingOverlay =
    gridProps?.loadingOverlayComponent !== undefined ||
    gridProps?.loadingOverlayComponentParams !== undefined ||
    gridProps?.overlayLoadingTemplate !== undefined;
  const hasNoRowsOverlay =
    gridProps?.noRowsOverlayComponent !== undefined ||
    gridProps?.noRowsOverlayComponentParams !== undefined ||
    gridProps?.overlayNoRowsTemplate !== undefined;

  return {
    ...(!hasLoadingOverlay && {
      overlayLoadingTemplate: DEFAULT_AG_GRID_LOADING_TEMPLATE,
    }),
    ...(!hasNoRowsOverlay && {
      overlayNoRowsTemplate: DEFAULT_AG_GRID_NO_ROWS_TEMPLATE,
    }),
  };
};

const syncNoRowsOverlay = <TData>(
  event: FilterChangedEvent<TData>,
  loading?: boolean,
) => {
  // loading 중에는 no rows overlay가 loading overlay를 가리지 않도록 둔다.
  if (loading) {
    return;
  }

  if (event.api.getDisplayedRowCount() === 0) {
    event.api.showNoRowsOverlay();
    return;
  }

  event.api.hideOverlay();
};

export const createAgGridOptions = <TData>({
  gridProps,
  syncNoRowsOverlayOnFilter = true,
}: {
  gridProps?: AgGridOptions<TData>;
  syncNoRowsOverlayOnFilter?: boolean;
} = {}): GridOptions<TData> => {
  // AG Grid에 전달하기 전에 wrapper 전용 handler를 원본 event handler로 변환한다.
  const {
    onRowClicked,
    onRowDoubleClicked,
    ...agGridProps
  } = gridProps ?? {};
  const mergedGridProps: GridOptions<TData> = {
    ...getDefaultAgGridOptions<TData>(),
    ...getDefaultAgGridOverlayOptions(gridProps),
    ...agGridProps,
    defaultColDef: {
      ...getDefaultAgGridColDef<TData>(),
      ...agGridProps.defaultColDef,
    },
  };

  if (onRowClicked) {
    mergedGridProps.onRowClicked = (event) => {
      if (event.data === undefined) {
        return;
      }

      onRowClicked(event.data, event);
    };
  }

  if (onRowDoubleClicked) {
    mergedGridProps.onRowDoubleClicked = (event) => {
      if (event.data === undefined) {
        return;
      }

      onRowDoubleClicked(event.data, event);
    };
  }

  if (syncNoRowsOverlayOnFilter || agGridProps.onFilterChanged) {
    mergedGridProps.onFilterChanged = (event) => {
      if (syncNoRowsOverlayOnFilter) {
        syncNoRowsOverlay(event, agGridProps.loading);
      }

      agGridProps.onFilterChanged?.(event);
    };
  }

  return mergedGridProps;
};
