import "./DataTable.css";

import {
  createGrid,
  type GridApi,
  type GridOptions,
  type ManagedGridOptions,
  type Module,
  themeQuartz,
} from "ag-grid-community";
import clsx from "clsx";
import {
  type CSSProperties,
  forwardRef,
  useEffect,
  useMemo,
  useRef,
} from "react";

export type DataTableSize = "xsmall" | "small" | "medium" | "large";

const ROW_HEIGHT_BY_SIZE: Record<DataTableSize, number> = {
  xsmall: 32,
  small: 40,
  medium: 48,
  large: 56,
};

export type DataTableProps = {
  className?: string;
  gridProps?: GridOptions;
  height?: CSSProperties["height"];
  modules?: Module[];
  rowBorder?: boolean;
  size?: DataTableSize;
  style?: CSSProperties;
  striped?: boolean;
  vertical?: boolean;
  width?: CSSProperties["width"];
};

export const DataTable = forwardRef<HTMLDivElement, DataTableProps>(({
  className,
  gridProps,
  height = "100%",
  modules,
  rowBorder = true,
  size = "small",
  style,
  striped = false,
  vertical = false,
  width = "100%",
}, ref) => {
  const gridElementRef = useRef<HTMLDivElement>(null);
  const gridApiRef = useRef<GridApi | null>(null);
  const modulesKey = useMemo(
    () => modules?.map((module) => module.moduleName).join("|") ?? "",
    [modules],
  );
  const latestModulesRef = useRef(modules);
  const rowHeight = gridProps?.rowHeight ?? ROW_HEIGHT_BY_SIZE[size];
  const theme = useMemo(
    () =>
      themeQuartz.withParams({
        accentColor: "#2563eb",
        backgroundColor: "#ffffff",
        borderColor: "#d0d5dd",
        borderRadius: 6,
        cellHorizontalPadding: 12,
        cellTextColor: "#172033",
        columnBorder: vertical,
        fontFamily:
          '"Inter", "Noto Sans KR", system-ui, -apple-system, BlinkMacSystemFont, sans-serif',
        fontSize: size === "xsmall" ? 13 : 15,
        foregroundColor: "#172033",
        headerBackgroundColor: "#f8fafc",
        headerFontWeight: 700,
        headerTextColor: "#475467",
        rowBorder,
        rowHoverColor: "#f8fafc",
        selectedRowBackgroundColor: "#eff6ff",
        spacing: 8,
        wrapperBorderRadius: 6,
      }),
    [rowBorder, size, vertical],
  );
  const mergedGridProps = useMemo<GridOptions>(
    () => ({
      headerHeight: rowHeight,
      rowHeight,
      theme,
      ...gridProps,
    }),
    [gridProps, rowHeight, theme],
  );
  const wrapperStyle = useMemo<CSSProperties>(
    () => ({
      height,
      width,
      ...style,
    }),
    [height, style, width],
  );
  const latestGridPropsRef = useRef(mergedGridProps);

  latestModulesRef.current = modules;
  latestGridPropsRef.current = mergedGridProps;

  useEffect(() => {
    if (!gridElementRef.current) {
      return;
    }

    const api = createGrid(
      gridElementRef.current,
      latestGridPropsRef.current,
      {
        modules: latestModulesRef.current,
      },
    );
    gridApiRef.current = api;

    return () => {
      api.destroy();
      if (gridApiRef.current === api) {
        gridApiRef.current = null;
      }
    };
  }, [modulesKey]);

  useEffect(() => {
    const api = gridApiRef.current;

    if (!api) {
      return;
    }

    const updatableGridProps = { ...mergedGridProps };
    delete updatableGridProps.getRowId;

    api.updateGridOptions(updatableGridProps as ManagedGridOptions);
  }, [mergedGridProps]);

  return (
    <div
      ref={ref}
      className={clsx(
        "sharedDataTable",
        `sharedDataTable--${size}`,
        {
          "sharedDataTable--rowBorder": rowBorder,
          "sharedDataTable--striped": striped,
          "sharedDataTable--vertical": vertical,
        },
        className,
      )}
      style={wrapperStyle}
    >
      <div className="sharedDataTable__grid" ref={gridElementRef} />
    </div>
  );
});

DataTable.displayName = "DataTable";
