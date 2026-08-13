import type { ICellRendererParams } from "ag-grid-community";

import { Toggle } from "@hae-fe/elements";

import type { HomeMenuVisitItem } from "../model";

interface FavoriteToggleCellProps extends ICellRendererParams<HomeMenuVisitItem> {
  favoriteItems: Set<string>;
  onFavoriteToggle: (screenId: string, isFavorite: boolean) => void;
}

export function FavoriteToggleCell(props: FavoriteToggleCellProps) {
  const { data, favoriteItems, onFavoriteToggle } = props;
  if (!data) return null;

  const checked = favoriteItems.has(data.screenId);

  return (
    <div className="flex h-full w-full items-center justify-center">
      <Toggle
        checked={checked}
        type="toggle_button"
        buttonIconType="star"
        size="small"
        onChange={() => onFavoriteToggle(data.screenId, !checked)}
      />
    </div>
  );
}
