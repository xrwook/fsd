import { Pagination } from "@hae-fe/elements";
import { DataTable } from "@hae-fe/pattern";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { useGetHomeNoticesQuery } from "../api";
import { COLUMN_DEFS } from "./_NoticeSummaryColumnDefs";
import { SummaryListCard } from "./_SummaryListCard";

const rowClassRules = {
  rowHoverable: () => true,
};

const PAGE_SIZE = 10;

export function NoticeSummaryList() {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);

  const {
    data: { data: { content = [], totalCount = 0, totalPages = 0 } = {} } = {},
    isLoading,
  } = useGetHomeNoticesQuery({
    query: {
      page: page - 1,
      size: PAGE_SIZE,
    },
  });

  const compactColumnDefs = COLUMN_DEFS.filter((col) =>
    ["title", "modifiedDate"].includes(col.field as string),
  );

  return (
    <SummaryListCard
      title="공지사항"
      count={totalCount}
      moreLink={{ label: "더보기", onClick: () => navigate("/service/notice") }}
    >
      <div className="flex h-133 min-h-120 flex-col gap-5">
        <DataTable
          className="md:min-auto h-132 flex-1"
          gridProps={{
            domLayout: "normal",
            columnDefs: compactColumnDefs,
            rowData: content,
            rowHeight: 44,
            rowClassRules: rowClassRules,
            // onRowClicked: handleRowClick,// rowLink
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
