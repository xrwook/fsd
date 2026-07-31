import {
  Button,
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  Tab,
} from "@hae-fe/elements";
import { DataTable } from "@hae-fe/pattern";
import type { ColDef, GridApi } from "ag-grid-community";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { Empty } from "@/shared/ui/empty";
import { DataTableToolbarKr } from "@/shared/ui/layout";

import { useGetFaqCategoryListQuery } from "../../faq-category/api/faqCategory";
import { StausBadgeRenderer } from "../../faq-list/model/stausBadgeRenderer";
import {
  type FaqDisplayItem,
  useFaqDisplaySortMutation,
  useGetFaqDisplayAllQuery,
} from "../api/faqDisplay";

const DISPLAY_COLUMN_DEFS: ColDef<FaqDisplayItem>[] = [
  {
    field: "question",
    headerName: "제목",
    minWidth: 400,
    flex: 1,
    rowDrag: true,
    cellRenderer: StausBadgeRenderer,
    cellRendererParams: {
      mode: "textBadge",
      badgeField: "isTop10",
      badgeText: "TOP 10",
      textField: "question",
    },
  },
];

interface DisplayModalProps {
  modalOpen: boolean;
  onModalOpen: (value: boolean) => void;
  onSuccess: (value: boolean) => void;
}

export const DisplayModal = ({
  modalOpen,
  onModalOpen,
  onSuccess,
}: DisplayModalProps) => {
  const gridApiRef = useRef<GridApi<FaqDisplayItem> | null>(null);
  const [categoryId, setCategoryId] = useState("");
  const [rowData, setRowData] = useState<FaqDisplayItem[]>([]);
  const [isDirty, setIsDirty] = useState(false);
  const { data: categoryResponse } = useGetFaqCategoryListQuery(
    {
      query: {
        searchFixedType: "NORMAL",
      },
    },
    modalOpen,
  );
  const { data: displayResponse } = useGetFaqDisplayAllQuery(
    {
      path: {
        faqCategoryId: categoryId,
      },
    },
    modalOpen && !!categoryId,
  );
  const { mutate: saveDisplaySort } = useFaqDisplaySortMutation();

  const categories = categoryResponse?.data ?? [];
  const tabItems = useMemo(
    () =>
      categories.map((category) => ({
        label: category.categoryName,
        value: category.id,
      })),
    [categories],
  );

  useEffect(() => {
    if (!modalOpen) return;
    if (!categories.length) {
      setCategoryId("");
      return;
    }
    if (
      !categoryId ||
      !categories.some((category) => category.id === categoryId)
    ) {
      setCategoryId(categories[0].id);
    }
  }, [categories, categoryId, modalOpen]);

  useEffect(() => {
    if (!modalOpen) return;

    setRowData(displayResponse?.data ?? []);
    setIsDirty(false);
  }, [displayResponse?.data, modalOpen]);

  const handleCancel = () => {
    onModalOpen(false);
  };

  const collectRows = useCallback(() => {
    const latestRows: FaqDisplayItem[] = [];
    gridApiRef.current?.forEachNode((node) => {
      if (node.data) latestRows.push(node.data);
    });
    return latestRows;
  }, []);

  const handleGridChange = useCallback(() => {
    setRowData(collectRows());
    setIsDirty(true);
  }, [collectRows]);

  const handleSaveSort = useCallback(() => {
    if (!categoryId) return;

    const latestRows = collectRows();

    saveDisplaySort(
      {
        path: {
          faqCategoryId: categoryId,
        },
        requestBody: {
          sortedFaqs: latestRows.map((row) => ({
            id: row.id,
            version: row.version,
          })),
        },
      },
      {
        onSuccess: () => {
          setRowData(latestRows);
          setIsDirty(false);
          onSuccess(true);
        },
      },
    );
  }, [categoryId, collectRows, onSuccess, saveDisplaySort]);

  const handleConfirm = () => {
    if (isDirty) {
      handleSaveSort();
      return;
    }

    onModalOpen(false);
  };

  const NoRowsOverlay = () => (
    <div className="pointer-events-auto">
      <Empty text="전시 대상 FAQ가 없습니다." />
    </div>
  );

  return (
    <Dialog
      hdsProps={{ hasFooter: true, hasHeader: true, maxWidth: "md" }}
      open={modalOpen}
      onClose={handleCancel}
    >
      <DialogHeader
        hdsProps={{ showCloseIcon: true, onClose: handleCancel }}
        className="min-w-300"
      >
        노출 순서 설정
      </DialogHeader>
      <DialogContent>
        <div className="flex h-140 flex-col">
          <Tab
            className="mb-5"
            hdsProps={{ type: "line", size: "medium" }}
            items={tabItems}
            value={categoryId}
            onChange={(_event: unknown, newValue: unknown) => {
              setCategoryId(String(newValue ?? ""));
              setIsDirty(false);
            }}
          />
          <div className="flex-1">
            <DataTableToolbarKr
              count={rowData.length}
              actions={
                <>
                  <Button
                    size="small"
                    semantic="neutral"
                    styleOption="outline"
                    disabled={!isDirty || !categoryId}
                    onClick={handleSaveSort}
                  >
                    순서저장
                  </Button>
                </>
              }
            />
            <DataTable
              gridProps={{
                domLayout: "autoHeight",
                rowData,
                columnDefs: DISPLAY_COLUMN_DEFS,
                getRowId: (params: { data: FaqDisplayItem }) => params.data.id,
                rowDragManaged: true,
                suppressCellFocus: true,
                suppressRowClickSelection: true,
                animateRows: true,
                noRowsOverlayComponent: NoRowsOverlay,
                onGridReady: (params: { api: GridApi<FaqDisplayItem> }) => {
                  gridApiRef.current = params.api;
                },
                onRowDragEnd: handleGridChange,
              }}
            />
          </div>
        </div>
      </DialogContent>
      <DialogFooter
        hdsProps={{
          positiveButton: { children: "확인", onClick: handleConfirm },
        }}
      />
    </Dialog>
  );
};
