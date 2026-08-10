import type { ColDef } from "ag-grid-community";
import { DateTime } from "luxon";

import { PartnershipStatusBadgeRenderer } from "../ui/_PartnershipStatusBadgeRenderer";
import type { PartnershipListItem } from "./partnershipList";

const formatDateTimeValue = (value: Date | string | null | undefined) => {
  if (!value) return "-";

  const dateTime =
    value instanceof Date
      ? DateTime.fromJSDate(value)
      : DateTime.fromISO(value);

  return dateTime.isValid
    ? dateTime.toFormat("yyyy-MM-dd HH:mm")
    : String(value);
};

export const COLUMN_DEFS: ColDef<PartnershipListItem>[] = [
  {
    field: "companyName",
    headerName: "회사명",
    minWidth: 240,
    flex: 1,
  },
  {
    field: "adminName",
    headerName: "요청자명",
    width: 160,
  },
  {
    field: "requestAt",
    headerName: "요청일시",
    width: 184,
    valueFormatter: ({ value }: { value: string | Date | null }) =>
      formatDateTimeValue(value),
  },
  {
    field: "confirmAdminName",
    headerName: "확인자",
    width: 160,
    valueFormatter: ({ value }: { value: string | null }) => value || "-",
  },
  {
    field: "confirmAt",
    headerName: "확인일시",
    width: 184,
    valueFormatter: ({ value }: { value: string | Date | null }) =>
      formatDateTimeValue(value),
  },
  {
    field: "processStatusCd",
    headerName: "처리 상태",
    width: 112,
    cellRenderer: PartnershipStatusBadgeRenderer,
  },
];
