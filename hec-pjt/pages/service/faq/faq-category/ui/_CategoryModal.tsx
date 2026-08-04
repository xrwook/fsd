import {
  Button,
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
} from "@hae-fe/elements";
import { DataTable } from "@hae-fe/pattern";
import { type GridApi } from "ag-grid-community";
import { useCallback, useEffect, useRef, useState } from "react";

import {
  type CategoryRow,
  CategoryRowClassRules,
  POPUP_COLUMN_DEFS,
} from "../model/columnDefs";
import { DataTableToolbarKr } from "@/shared/ui/layout";

import {
  type FaqCategorySaveItem,
  useFaqCategorySaveMutation,
  useGetFaqCategoryListQuery,
} from "../api/faqCategory";

let rowIdSeq = 100;

const createRow = (overrides: Partial<CategoryRow> = {}): CategoryRow => ({
  id: rowIdSeq++,
  category: "",
  readOnly: false,
  ...overrides,
});

const isChangedRow = (row: CategoryRow, originalRows: CategoryRow[]) => {
  if (typeof row.id !== "string") return true;

  const originalRow = originalRows.find(
    (original) => String(original.id) === String(row.id),
  );
  if (!originalRow) return true;

  return originalRow.category.trim() !== row.category.trim();
};

const validateRows = (rows: CategoryRow[], originalRows: CategoryRow[]) => {
  const categoryCount = rows.reduce<Map<string, number>>((acc, row) => {
    const category = row.category.trim();
    if (!category) return acc;

    acc.set(category, (acc.get(category) ?? 0) + 1);
    return acc;
  }, new Map());

  return rows.map((row) => {
    const category = row.category.trim();
    const changed = isChangedRow(row, originalRows);
    let categoryError: string | undefined;

    if (changed && !category) {
      categoryError = "카테고리명을 입력해 주세요.";
    } else if (changed && (categoryCount.get(category) ?? 0) > 1) {
      categoryError = "중복된 카테고리명입니다.";
    }

    return {
      ...row,
      categoryError: row.readOnly ? undefined : categoryError,
    };
  });
};

const hasValidationError = (rows: CategoryRow[]) => {
  return rows.some((row) => !!row.categoryError);
};

interface CategoryModalProps {
  open: boolean;
  onOpen: (open: boolean) => void;
  onSave: (rows: CategoryRow[]) => void;
}

const CategoryModal = ({ open, onOpen, onSave }: CategoryModalProps) => {
  const gridApiRef = useRef<GridApi<CategoryRow> | null>(null);
  const originalRowsRef = useRef<CategoryRow[]>([]);
  const [isDirty, setIsDirty] = useState(false);
  const [rowData, setRowData] = useState<CategoryRow[]>([]);
  const { data: categoryResponse } = useGetFaqCategoryListQuery(
    {
      query: {
        searchFixedType: "NORMAL",
      },
    },
    open,
  );
  const { mutate: saveCategory } = useFaqCategorySaveMutation();

  useEffect(() => {
    if (!open || !categoryResponse?.data) return;

    const rows = categoryResponse.data.map((category) =>
      createRow({
        id: category.id,
        category: category.categoryName,
        faqCount: category.faqCount,
        fixedType: category.fixedType,
        readOnly: category.fixedType === "TOP10",
        version: category.version,
      }),
    );

    originalRowsRef.current = rows;
    setRowData(rows);
    setIsDirty(false);
  }, [categoryResponse?.data, open]);

  const handleClose = useCallback(() => {
    onOpen(false);
  }, [onOpen]);

  const handleAddRow = useCallback(() => {
    setRowData((prev) => [...prev, createRow()]);
    setIsDirty(true);
  }, []);

  const handleGridChange = useCallback(() => {
    setIsDirty(true);
  }, []);

  const handleDeleteRow = useCallback((target: CategoryRow) => {
    gridApiRef.current?.applyTransaction({ remove: [target] });
    setRowData((prev) =>
      prev.filter((row) => String(row.id) !== String(target.id)),
    );
    setIsDirty(true);
  }, []);

  const handleGridReady = useCallback(
    (params: { api: GridApi<CategoryRow> }) => {
      gridApiRef.current = params.api;
    },
    [],
  );

  const handleSave = useCallback(() => {
    const latestRows: CategoryRow[] = [];
    gridApiRef.current?.forEachNode((node) => {
      if (node.data) latestRows.push(node.data);
    });

    const validatedRows = validateRows(latestRows, originalRowsRef.current);
    if (hasValidationError(validatedRows)) {
      setRowData(validatedRows);
      setIsDirty(true);
      requestAnimationFrame(() => {
        gridApiRef.current?.resetRowHeights();
      });
      return;
    }

    const latestServerIds = new Set(
      latestRows
        .filter((row) => typeof row.id === "string")
        .map((row) => String(row.id)),
    );
    const deletedRows = originalRowsRef.current.filter(
      (row) =>
        typeof row.id === "string" &&
        !row.readOnly &&
        !latestServerIds.has(String(row.id)),
    );
    const sortedCategories: FaqCategorySaveItem[] = [
      ...latestRows
        .map((row) => ({
          ...row,
          category: row.category.trim(),
          categoryError: undefined,
        }))
        .filter((row) => !row.readOnly && row.category.trim())
        .map((row) => ({
          id: typeof row.id === "string" ? row.id : null,
          categoryName: row.category.trim(),
          version: row.version ?? 0,
          isDeleted: false,
        })),
      ...deletedRows.map((row) => ({
        id: String(row.id),
        categoryName: row.category,
        version: row.version ?? 0,
        isDeleted: true,
      })),
    ];

    saveCategory(
      {
        requestBody: {
          sortedCategories,
        },
      },
      {
        onSuccess: () => {
          onSave(latestRows);
          onOpen(false);
          setIsDirty(false);
        },
      },
    );
  }, [onSave, onOpen, saveCategory]);

  return (
    <>
      <Dialog
        open={open}
        onClose={handleClose}
        hdsProps={{ hasFooter: true, hasHeader: true }}
      >
        <DialogHeader hdsProps={{ showCloseIcon: true, onClose: handleClose }}>
          카테고리 관리
        </DialogHeader>
        <DialogContent hdsProps className="min-h-110 w-[90vw] max-w-108">
          <div>
            <DataTableToolbarKr
              count={rowData.length}
              actions={
                <>
                  <Button
                    styleOption="fill"
                    semantic="brand"
                    size="small"
                    onClick={handleAddRow}
                  >
                    추가
                  </Button>
                </>
              }
            />
            <DataTable
              gridProps={{
                domLayout: "autoHeight",
                columnDefs: POPUP_COLUMN_DEFS,
                rowData,
                rowClassRules: CategoryRowClassRules,
                context: {
                  onCategoryChange: handleGridChange,
                  onCategoryDelete: handleDeleteRow,
                },
                getRowId: (p: any) => String(p.data.id),
                getRowHeight: (params: any) =>
                  params.data?.categoryError ? 80 : undefined,
                getRowStyle: (params: any) =>
                  params.data?.categoryError
                    ? { backgroundColor: "#F4F7FD" }
                    : undefined,
                rowDragManaged: true,
                animateRows: true,
                suppressCellFocus: true,
                suppressRowClickSelection: true,
                onGridReady: handleGridReady,
                onCellValueChanged: handleGridChange,
                onRowDragEnd: handleGridChange,
              }}
            />
          </div>
        </DialogContent>
        <DialogFooter
          hdsProps={{
            negativeButton: {
              children: "취소",
              onClick: handleClose,
            },
            positiveButton: {
              children: "저장",
              disabled: !isDirty,
              onClick: handleSave,
            },
          }}
        />
      </Dialog>
    </>
  );
};

export default CategoryModal;
