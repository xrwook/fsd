import {
  Button,
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
} from "@hae-fe/elements";
import { DataTable } from "@hae-fe/pattern";
import type { GridApi } from "ag-grid-community";
import { useCallback, useEffect, useRef, useState } from "react";

import { useSystemModal } from "@/shared/lib/modal";
import { DataTableToolbarKr } from "@/shared/ui/layout";

import {
  useDeleteTermTypeMutation,
  useGetTermTypeListQuery,
  useSaveTermTypesMutation,
} from "../api";
import {
  TERM_TYPE_COLUMN_DEFS,
  TermTypeRowClassRules,
  type TermTypeRow,
} from "../model";

let rowIdSeq = 100;

const TERM_CODE_PATTERN = /^[A-Z0-9_]+$/;

const createRow = (overrides: Partial<TermTypeRow> = {}): TermTypeRow => ({
  id: `new-${rowIdSeq++}`,
  termCode: "",
  termName: "",
  isNew: true,
  readOnlyCode: false,
  ...overrides,
});

const validateRows = (rows: TermTypeRow[]) => {
  const termCodeCount = rows.reduce<Map<string, number>>((acc, row) => {
    const termCode = row.termCode.trim();
    if (!termCode) return acc;

    acc.set(termCode, (acc.get(termCode) ?? 0) + 1);
    return acc;
  }, new Map());

  return rows.map((row) => {
    const termCode = row.termCode.trim();
    const termName = row.termName.trim();
    let termCodeError: string | undefined;
    let termNameError: string | undefined;

    if (!termName) {
      termNameError = "약관 종류를 입력해 주세요.";
    } else if (termName.length > 100) {
      termNameError = "약관 종류는 100자 이하로 입력해 주세요.";
    }

    if (!termCode) {
      termCodeError = "약관 코드를 입력해 주세요.";
    } else if (termCode.length > 50) {
      termCodeError = "약관 코드는 50자 이하로 입력해 주세요.";
    } else if (!TERM_CODE_PATTERN.test(termCode)) {
      termCodeError = "대문자, 숫자, 언더스코어만 입력해 주세요.";
    } else if ((termCodeCount.get(termCode) ?? 0) > 1) {
      termCodeError = "중복된 약관 코드입니다.";
    }

    return {
      ...row,
      termCode: termCode.toUpperCase(),
      termName,
      termCodeError,
      termNameError,
    };
  });
};

const hasValidationError = (rows: TermTypeRow[]) => {
  return rows.some((row) => !!row.termCodeError || !!row.termNameError);
};

type Props = {
  open: boolean;
  onOpen: (open: boolean) => void;
  onSave: () => void;
};

export const TermTypeManageModal = ({ open, onOpen, onSave }: Props) => {
  const gridApiRef = useRef<GridApi<TermTypeRow> | null>(null);
  const [rowData, setRowData] = useState<TermTypeRow[]>([]);
  const [isDirty, setIsDirty] = useState(false);
  const { dangerConfirm, snackbar } = useSystemModal();
  const { data: termsResponse } = useGetTermTypeListQuery();
  const { mutate: saveTermTypes } = useSaveTermTypesMutation();
  const { mutate: deleteTermType } = useDeleteTermTypeMutation();

  useEffect(() => {
    if (!open || !termsResponse?.data) return;

    const rows = termsResponse.data.map((term) =>
      createRow({
        id: term.termCode,
        termCode: term.termCode,
        termName: term.termName,
        isNew: false,
        sortOrder: term.sortOrder,
        readOnlyCode: true,
      }),
    );

    setRowData(rows);
    setIsDirty(false);
  }, [open, termsResponse?.data]);

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
    (params: { api: GridApi<TermTypeRow> }) => {
      gridApiRef.current = params.api;
    },
    [],
  );

  const handleDeleteRow = useCallback(
    async (target: TermTypeRow) => {
      if (target.isNew) {
        gridApiRef.current?.applyTransaction({ remove: [target] });
        setRowData((prev) =>
          prev.filter((row) => String(row.id) !== String(target.id)),
        );
        setIsDirty(true);
        return;
      }

      const result = await dangerConfirm({
        title: "삭제 확인",
        message:
          "약관 종류를 삭제하시겠습니까? \n등록된 약관 상세가 있으면 삭제할 수 없습니다.",
      });

      if (!result) return;

      deleteTermType(
        {
          path: {
            termCode: target.termCode,
          },
        },
        {
          onSuccess: () => {
            gridApiRef.current?.applyTransaction({ remove: [target] });
            setRowData((prev) =>
              prev.filter((row) => String(row.id) !== String(target.id)),
            );
            snackbar({ message: "삭제가 완료되었습니다." });
          },
        },
      );
    },
    [dangerConfirm, deleteTermType, snackbar],
  );

  const handleSave = useCallback(() => {
    const latestRows: TermTypeRow[] = [];
    gridApiRef.current?.forEachNode((node) => {
      if (node.data) latestRows.push(node.data);
    });

    const validatedRows = validateRows(latestRows);

    if (hasValidationError(validatedRows)) {
      setRowData(validatedRows);
      setIsDirty(true);
      requestAnimationFrame(() => {
        gridApiRef.current?.resetRowHeights();
      });
      return;
    }

    saveTermTypes(
      {
        requestBody: {
          items: validatedRows.map((row) => ({
            termCode: row.termCode,
            termName: row.termName,
          })),
        },
      },
      {
        onSuccess: () => {
          onSave();
          onOpen(false);
          setIsDirty(false);
        },
      },
    );
  }, [onOpen, onSave, saveTermTypes]);

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      hdsProps={{ hasFooter: true, hasHeader: true }}
    >
      <DialogHeader hdsProps={{ showCloseIcon: true, onClose: handleClose }}>
        약관 종류 관리
      </DialogHeader>
      <DialogContent hdsProps className="min-h-110 w-[90vw] max-w-108">
        <DataTableToolbarKr
          count={rowData.length}
          actions={
            <Button
              styleOption="fill"
              semantic="brand"
              size="small"
              onClick={handleAddRow}
            >
              추가
            </Button>
          }
        />
        <DataTable
          gridProps={{
            domLayout: "autoHeight",
            columnDefs: TERM_TYPE_COLUMN_DEFS,
            rowData,
            rowClassRules: TermTypeRowClassRules,
            context: {
              onTermTypeChange: handleGridChange,
              onTermTypeDelete: handleDeleteRow,
            },
            getRowId: (p: any) => String(p.data.id),
            getRowHeight: (params: any) =>
              params.data?.termCodeError || params.data?.termNameError
                ? 80
                : undefined,
            getRowStyle: (params: any) =>
              params.data?.termCodeError || params.data?.termNameError
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
  );
};
