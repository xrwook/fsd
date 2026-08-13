import type { ColDef } from "ag-grid-community";
import { DateTime } from "luxon";

import { FavoriteToggleCell } from "./_FavoriteToggleCell";
import type { HomeMenuVisitItem } from "../model";

type HomeMenuDateField = "favoritedAt" | "visitedAt";

interface GetColumnDefsParams {
  favoriteItems: Set<string>;
  onFavoriteToggle: (screenId: string, isFavorite: boolean) => void;
  dateHeaderName?: string;
  dateField?: HomeMenuDateField;
}

const formatDateTimeValue = (value: string | null | undefined) => {
  if (!value) return "-";

  const dateTime = DateTime.fromISO(value);

  return dateTime.isValid ? dateTime.toFormat("yyyy-MM-dd HH:mm") : value;
};

export const getColumnDefs = ({
  favoriteItems,
  onFavoriteToggle,
  dateHeaderName = "추가일시",
  dateField = "favoritedAt",
}: GetColumnDefsParams): ColDef<HomeMenuVisitItem>[] => [
  {
    field: "screenId",
    headerName: "",
    width: 44,
    cellRenderer: FavoriteToggleCell,
    cellRendererParams: { favoriteItems, onFavoriteToggle },
  },
  {
    field: "name",
    headerName: "메뉴 명",
    flex: 1,
  },
  {
    field: dateField,
    headerName: dateHeaderName,
    width: 130,
    valueFormatter: ({ value }: { value: string | null }) =>
      formatDateTimeValue(value),
  },
];
