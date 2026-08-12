import {
  Button,
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  IconButton,
} from "@hae-fe/elements";
import { IconTrash } from "@hae-fe/icon-library/react";
import { DataTable } from "@hae-fe/pattern";
import type {
  ColDef,
  GetRowIdParams,
  GridApi,
  ICellRendererParams,
  RowClassParams,
  RowHeightParams,
} from "ag-grid-community";
import {
  type MouseEvent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import { useSystemModal } from "@/shared/lib/modal";
import { DataTableToolbarKr } from "@/shared/ui/layout";

import { GridTextInputRenderer } from "../../../shared/ui/ag-grid";
import type { TermTypeItem, TermTypeRow, TermTypeSaveItem } from "../model";

let rowIdSeq = 100;

const TERM_CODE_PATTERN = /^[A-Z0-9_]+$/;
const TERM_NAME_MAX_LENGTH = 100;
const TERM_CODE_MAX_LENGTH = 50;

const createRow = (overrides: Partial<TermTypeRow> = {}): TermTypeRow => ({
  id: `new-${rowIdSeq++}`,
  termCode: "",
  termName: "",
  isNew: true,
  termCodeIsError: false,
  termNameIsError: false,
  readOnlyCode: false,
  ...overrides,
});

const findOriginalRow = (row: TermTypeRow, originalRows: TermTypeRow[]) => {
  return originalRows.find(
    (originalRow) => String(originalRow.id) === String(row.id),
  );
};

const isTermNameInput = (row: TermTypeRow, originalRows: TermTypeRow[]) => {
  const originalRow = findOriginalRow(row, originalRows);

  return !originalRow || originalRow.termName.trim() !== row.termName.trim();
};

const isTermCodeInput = (row: TermTypeRow, originalRows: TermTypeRow[]) => {
  const originalRow = findOriginalRow(row, originalRows);

  return !originalRow || originalRow.termCode.trim() !== row.termCode.trim();
};

const createInputCountMap = (
  rows: TermTypeRow[],
  originalRows: TermTypeRow[],
  fieldName: "termCode" | "termName",
  isInput: (row: TermTypeRow, originalRows: TermTypeRow[]) => boolean,
) => {
  return rows.reduce<Map<string, number>>((acc, row) => {
    if (!isInput(row, originalRows)) return acc;

    const value = row[fieldName].trim();
    if (!value) return acc;

    acc.set(value, (acc.get(value) ?? 0) + 1);
    return acc;
  }, new Map());
};

const createExistingValueSet = (
  rows: TermTypeRow[],
  originalRows: TermTypeRow[],
  fieldName: "termCode" | "termName",
  isInput: (row: TermTypeRow, originalRows: TermTypeRow[]) => boolean,
) => {
  return rows.reduce<Set<string>>((acc, row) => {
    if (isInput(row, originalRows)) return acc;

    const value = row[fieldName].trim();
    if (value) acc.add(value);

    return acc;
  }, new Set());
};

const validateRows = (rows: TermTypeRow[], originalRows: TermTypeRow[]) => {
  const termNameInputCount = createInputCountMap(
    rows,
    originalRows,
    "termName",
    isTermNameInput,
  );
  const termCodeInputCount = createInputCountMap(
    rows,
    originalRows,
    "termCode",
    isTermCodeInput,
  );
  const existingTermNameSet = createExistingValueSet(
    rows,
    originalRows,
    "termName",
    isTermNameInput,
  );
  const existingTermCodeSet = createExistingValueSet(
    rows,
    originalRows,
    "termCode",
    isTermCodeInput,
  );

  const hasDuplicateTermName = (row: TermTypeRow, termName: string) => {
    if (!isTermNameInput(row, originalRows)) return false;

    return (
      (termNameInputCount.get(termName) ?? 0) > 1 ||
      existingTermNameSet.has(termName)
    );
  };

  const hasDuplicateTermCode = (row: TermTypeRow, termCode: string) => {
    if (!isTermCodeInput(row, originalRows)) return false;

    return (
      (termCodeInputCount.get(termCode) ?? 0) > 1 ||
      existingTermCodeSet.has(termCode)
    );
  };

  return rows.map((row) => {
    const termCode = row.termCode.trim();
    const termName = row.termName.trim();
    let termCodeError: string | undefined;
    let termNameError: string | undefined;

    if (!termName) {
      termNameError = "약관 종류를 입력해 주세요.";
    } else if (termName.length > TERM_NAME_MAX_LENGTH) {
      termNameError = "최대 100자까지 입력할 수 있습니다.";
    } else if (hasDuplicateTermName(row, termName)) {
      termNameError = "중복된 약관 종류입니다.";
    }

    if (!termCode) {
      termCodeError = "약관 코드를 입력해 주세요.";
    } else if (termCode.length > TERM_CODE_MAX_LENGTH) {
      termCodeError = "최대 50자까지 입력할 수 있습니다.";
    } else if (!TERM_CODE_PATTERN.test(termCode)) {
      termCodeError = "영문 대문자, 숫자, 언더스코어(_)만 사용 가능합니다.";
    } else if (hasDuplicateTermCode(row, termCode)) {
      termCodeError = "중복된 약관 코드입니다.";
    }

    return {
      ...row,
      termCode,
      termName,
      termCodeError,
      termCodeIsError: !!termCodeError,
      termNameError,
      termNameIsError: !!termNameError,
    };
  });
};

const hasTermTypeError = (row?: TermTypeRow) => {
  return !!row?.termCodeIsError || !!row?.termNameIsError;
};

const hasValidationError = (rows: TermTypeRow[]) => {
  return rows.some((row) => hasTermTypeError(row));
};

const TermTypeDeleteButtonRenderer = (
  props: ICellRendererParams<TermTypeRow>,
) => {
  const { data } = props;
  if (!data) return null;

  const handleDelete = (e: MouseEvent) => {
    e.stopPropagation();
    props.context?.onTermTypeDelete?.(data);
  };

  return (
    <IconButton
      semantic="ghost"
      size="medium"
      styleOption="fill"
      aria-label={`${data.termName || data.termCode} 삭제`}
      onClick={handleDelete}
    >
      <IconTrash size={20} type="outline" color="#6B7280" />
    </IconButton>
  );
};

const TERM_TYPE_COLUMN_DEFS: ColDef<TermTypeRow>[] = [
  {
    headerName: "",
    width: 29,
    rowDrag: true,
    suppressMovable: true,
    sortable: false,
    filter: false,
    resizable: false,
  },
  {
    field: "termName",
    headerName: "약관 종류",
    minWidth: 240,
    flex: 1,
    sortable: false,
    filter: false,
    resizable: false,
    cellRenderer: GridTextInputRenderer,
    cellRendererParams: {
      fieldName: "termName",
      errorFieldName: "termNameError",
      isErrorFieldName: "termNameIsError",
      placeholder: "약관 종류를 입력해 주세요.",
      onChangeContextName: "onTermTypeChange",
    },
    cellClass: "inputCell",
  },
  {
    field: "termCode",
    headerName: "약관 코드",
    minWidth: 240,
    flex: 1,
    sortable: false,
    filter: false,
    resizable: false,
    cellRenderer: GridTextInputRenderer,
    cellRendererParams: {
      fieldName: "termCode",
      errorFieldName: "termCodeError",
      isErrorFieldName: "termCodeIsError",
      placeholder: "약관 코드를 입력해 주세요.",
      disabled: (data: TermTypeRow) => !!data.readOnlyCode,
      onChangeContextName: "onTermTypeChange",
    },
    cellClass: "inputCell",
  },
  {
    headerName: "",
    width: 44,
    sortable: false,
    filter: false,
    resizable: false,
    cellRenderer: TermTypeDeleteButtonRenderer,
    cellClass: "deleteCell",
  },
];

const TermTypeRowClassRules = {
  rowInvalid: (params: RowClassParams<TermTypeRow>) =>
    hasTermTypeError(params.data),
};

type MutationOptions = {
  onSuccess: () => void;
  onError: (message: string, nextItems?: TermTypeItem[]) => void;
};

type Props = {
  open: boolean;
  onOpen: (open: boolean) => void;
  items?: TermTypeItem[];
  onSave?: () => void;
  onSaveItems: (items: TermTypeSaveItem[], options: MutationOptions) => void;
  onDeleteItem: (termCode: string, options: MutationOptions) => void;
};

export const TermTypeManageModal = ({
  open,
  onOpen,
  items,
  onSave,
  onSaveItems,
  onDeleteItem,
}: Props) => {
  const gridApiRef = useRef<GridApi<TermTypeRow> | null>(null);
  const originalRowsRef = useRef<TermTypeRow[]>([]);
  const [rowData, setRowData] = useState<TermTypeRow[]>([]);
  const [isDirty, setIsDirty] = useState(false);
  const { alert, dangerConfirm, snackbar } = useSystemModal();

  const resetTermRows = useCallback((nextItems: TermTypeItem[]) => {
    const rows = nextItems.map((term) =>
      createRow({
        id: term.termCode,
        termCode: term.termCode,
        termName: term.termName,
        isNew: false,
        sortOrder: term.sortOrder,
        readOnlyCode: true,
      }),
    );

    originalRowsRef.current = rows;
    setRowData(rows);
    setIsDirty(false);
  }, []);

  useEffect(() => {
    if (!open || !items) return;

    resetTermRows(items);
  }, [items, open, resetTermRows]);

  const handleClose = useCallback(() => {
    onOpen(false);
  }, [onOpen]);

  const removeRow = useCallback((target: TermTypeRow) => {
    gridApiRef.current?.applyTransaction({ remove: [target] });
    setRowData((prev) =>
      prev.filter((row) => String(row.id) !== String(target.id)),
    );
  }, []);

  const handleAddRow = useCallback(() => {
    setRowData((prev) => [...prev, createRow()]);
    setIsDirty(true);
  }, []);

  const handleGridChange = useCallback(() => {
    setIsDirty(true);
  }, []);

  const handleDeleteRow = useCallback(
    async (target: TermTypeRow) => {
      if (target.isNew) {
        removeRow(target);
        setIsDirty(true);
        return;
      }

      const result = await dangerConfirm({
        title: "삭제 확인",
        message:
          "약관 종류를 삭제하시겠습니까? \n등록된 약관 상세가 있으면 삭제할 수 없습니다.",
      });

      if (!result) return;

      onDeleteItem(target.termCode, {
        onSuccess: () => {
          removeRow(target);
          snackbar({ message: "삭제가 완료되었습니다." });
        },
        onError: (message, nextItems) => {
          alert({ message });
          if (nextItems) resetTermRows(nextItems);
        },
      });
    },
    [alert, dangerConfirm, onDeleteItem, removeRow, resetTermRows, snackbar],
  );

  const handleGridReady = useCallback(
    (params: { api: GridApi<TermTypeRow> }) => {
      gridApiRef.current = params.api;
    },
    [],
  );

  const handleSave = useCallback(() => {
    const latestRows: TermTypeRow[] = [];
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

    onSaveItems(
      validatedRows.map((row) => ({
        termCode: row.termCode,
        termName: row.termName,
      })),
      {
        onSuccess: () => {
          onSave?.();
          handleClose();
          setIsDirty(false);
        },
        onError: (message, nextItems) => {
          alert({ message });
          if (nextItems) resetTermRows(nextItems);
        },
      },
    );
  }, [alert, handleClose, onSave, onSaveItems, resetTermRows]);

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
            getRowId: (p: GetRowIdParams<TermTypeRow>) => String(p.data.id),
            getRowHeight: (params: RowHeightParams<TermTypeRow>) =>
              hasTermTypeError(params.data) ? 80 : undefined,
            getRowStyle: (params: RowClassParams<TermTypeRow>) =>
              hasTermTypeError(params.data)
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
