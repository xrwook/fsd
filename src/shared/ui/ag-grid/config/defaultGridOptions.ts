import type {
  ColDef,
  FilterChangedEvent,
  GridOptions,
} from "ag-grid-community";

export const DEFAULT_AG_GRID_LOADING_TEMPLATE =
  '<span class="sharedDataTable__overlay">조회하고 있습니다.</span>';

export const DEFAULT_AG_GRID_NO_ROWS_TEMPLATE =
  '<span class="sharedDataTable__overlay">조회 결과가 없습니다.</span>';

export const getDefaultAgGridColDef = <TData,>(): ColDef<TData> => ({
  flex: 1,
  minWidth: 120,
  resizable: true,
  sortable: false,
});

export const getDefaultAgGridOptions = <TData,>(): GridOptions<TData> => ({
  animateRows: true,
  domLayout: "autoHeight",
  overlayLoadingTemplate: DEFAULT_AG_GRID_LOADING_TEMPLATE,
  overlayNoRowsTemplate: DEFAULT_AG_GRID_NO_ROWS_TEMPLATE,
  suppressCellFocus: true,
  suppressRowClickSelection: true,
});

const syncNoRowsOverlay = <TData,>(
  event: FilterChangedEvent<TData>,
  loading?: boolean,
) => {
  if (loading) {
    return;
  }

  if (event.api.getDisplayedRowCount() === 0) {
    event.api.showNoRowsOverlay();
    return;
  }

  event.api.hideOverlay();
};

export const createAgGridOptions = <TData,>({
  gridProps,
  syncNoRowsOverlayOnFilter = true,
}: {
  gridProps?: GridOptions<TData>;
  syncNoRowsOverlayOnFilter?: boolean;
} = {}): GridOptions<TData> => {
  const mergedGridProps: GridOptions<TData> = {
    ...getDefaultAgGridOptions<TData>(),
    ...gridProps,
    defaultColDef: {
      ...getDefaultAgGridColDef<TData>(),
      ...gridProps?.defaultColDef,
    },
  };

  if (syncNoRowsOverlayOnFilter || gridProps?.onFilterChanged) {
    mergedGridProps.onFilterChanged = (event) => {
      if (syncNoRowsOverlayOnFilter) {
        syncNoRowsOverlay(event, gridProps?.loading);
      }

      gridProps?.onFilterChanged?.(event);
    };
  }

  return mergedGridProps;
};
