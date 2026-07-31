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
                getRowId: (p: any) => String(p.data.id),
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
