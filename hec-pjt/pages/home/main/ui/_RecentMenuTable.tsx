import { Pagination } from "@hae-fe/elements";
import { DataTable } from "@hae-fe/pattern";
import { useCallback, useMemo, useState } from "react";

import {
  useGetHomeRecentVisitsQuery,
  useUpdateHomeFavoriteMutation,
} from "../api";
import type { HomeMenuVisitItem } from "../model";
import { getColumnDefs } from "./_HomeMenuColumnDefs";
import { SummaryListCard } from "./_SummaryListCard";

const rowClassRules = {
  rowHoverable: () => true,
};

const PAGE_SIZE = 10;

export function RecentMenuTable() {
  const [page, setPage] = useState(1);

  const {
    data: { data: { content = [], totalCount = 0, totalPages = 0 } = {} } = {},
    isLoading,
  } = useGetHomeRecentVisitsQuery({
    query: {
      page: page - 1,
      size: PAGE_SIZE,
    },
  });
  const { mutate: updateHomeFavorite } = useUpdateHomeFavoriteMutation();

  const favoriteItems = useMemo(
    () =>
      new Set(
        content
          .filter((item: HomeMenuVisitItem) => item.isFavorite)
          .map((item: HomeMenuVisitItem) => item.screenId),
      ),
    [content],
  );

  const handleFavoriteToggle = useCallback(
    (screenId: string, isFavorite: boolean) => {
      updateHomeFavorite({
        path: {
          screenId,
        },
        requestBody: {
          isFavorite,
        },
      });
    },
    [updateHomeFavorite],
  );

  const columnDefs = useMemo(
    () =>
      getColumnDefs({
        favoriteItems,
        onFavoriteToggle: handleFavoriteToggle,
        dateHeaderName: "추가일시",
        dateField: "visitedAt",
      }),
    [favoriteItems, handleFavoriteToggle],
  );

  return (
    <SummaryListCard title="최근 방문" count={totalCount}>
      <div className="flex h-133 min-h-120 flex-col gap-5">
        <DataTable
          // vertical
          className="md:min-auto h-132 flex-1"
          gridProps={{
            columnDefs,
            rowData: content,
            rowHeight: 44,
            getRowId: (p: { data: HomeMenuVisitItem }) => p.data.screenId,
            rowClassRules,
            defaultColDef: { suppressHeaderMenuButton: true },
            suppressCellFocus: true,
            suppressRowClickSelection: true,
            loading: isLoading,
          }}
        />
        <Pagination
          hdsProps={{
            button: true,
          }}
          onChange={(_event: unknown, value: number) => setPage(value)}
          count={Math.max(totalPages, 1)}
          page={page}
        />
      </div>
    </SummaryListCard>
  );
}
