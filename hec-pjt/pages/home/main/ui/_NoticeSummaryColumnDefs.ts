import type { ColDef } from "ag-grid-community";
import { DateTime } from "luxon";

import type { HomeNoticeListItem } from "../model";

const formatDateTimeValue = (value: string | null | undefined) => {
  if (!value) return "-";

  const dateTime = DateTime.fromISO(value);

  return dateTime.isValid ? dateTime.toFormat("yyyy-MM-dd HH:mm") : value;
};

export const COLUMN_DEFS: ColDef<HomeNoticeListItem>[] = [
  {
    field: "title",
    headerName: "제목",
    flex: 1,
  },
  {
    field: "modifiedDate",
    headerName: "최근 수정일",
    width: 130,
    valueFormatter: ({ value }: { value: string | null }) =>
      formatDateTimeValue(value),
  },
];
