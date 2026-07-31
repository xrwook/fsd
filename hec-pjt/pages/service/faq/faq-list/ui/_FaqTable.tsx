import {
  Icon3dEmptyCaseNoData,
  Icon3dEmptyCaseNoResults,
} from "@hae-fe/icon-library/react/3d";
import type { RowClickedEvent } from "ag-grid-community";

import DataGrid from "@/shared/ui/common-data-grid";
import { Empty } from "@/shared/ui/empty";

import { COLUMN_DEFS } from "../model";
import type { FaqListItem } from "../model/faqList";

type Props = {
  hasSearched: boolean;
  onChangePage: (value: number) => void;
  onRowClick: (row: FaqListItem) => void;
  page: number;
  totalCount: number;
  perPage: number;
  data?: FaqListItem[];
  isLoading: boolean;
};

const rowClassRules = {
  rowHoverable: () => true,
};

export const FaqTable = ({
  hasSearched,
  onChangePage,
  onRowClick,
  page,
  totalCount,
  perPage,
  data,
  isLoading,
}: Props) => {
  const NoRowsOverlay = () => (
    <div className="pointer-events-auto">
      <Empty
        title={hasSearched ? "검색 결과가 없습니다." : ""}
        text={
          hasSearched
            ? "검색어에 오타가 없는지 확인하거나, \n 다른 검색어를 입력해 보세요."
            : "등록된 FAQ가 없습니다."
        }
        icon={
          hasSearched ? (
            <Icon3dEmptyCaseNoResults style={{ width: "100px" }} />
          ) : (
            <Icon3dEmptyCaseNoData style={{ width: "100px" }} />
          )
        }
      />
    </div>
  );

  const handleRowClick = (params: RowClickedEvent<FaqListItem>) => {
    const target = params.event?.target as HTMLElement | null;

    if (target?.closest("button") || !params.data) {
      return;
    }

    onRowClick(params.data);
  };

  return (
    <DataGrid<FaqListItem>
      className="w-full flex-1"
      gridProps={{
        domLayout: "autoHeight",
        columnDefs: COLUMN_DEFS,
        rowData: data ?? [],
        rowClassRules,
        noRowsOverlayComponent: NoRowsOverlay,
        suppressRowClickSelection: true,
        loading: isLoading,
        onRowClicked: handleRowClick,
      }}
      pagination={{
        onChangePage,
        page,
        count: Math.ceil(totalCount / Math.max(perPage, 1)),
      }}
    />
  );
};
