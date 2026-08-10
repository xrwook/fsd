import type { RowClickedEvent } from "ag-grid-community";

import DataGrid from "@/shared/ui/common-data-grid";

import { COLUMN_DEFS, type PartnershipListItem } from "../model";
import { PartnershipNoRowsOverlay } from "./_PartnershipNoRowsOverlay";

type Props = {
  data?: PartnershipListItem[];
  hasSearched: boolean;
  isLoading: boolean;
  onChangePage: (value: number) => void;
  onRowClick: (row: PartnershipListItem) => void;
  page: number;
  perPage: number;
  totalCount: number;
};

const rowClassRules = {
  rowHoverable: () => true,
};

export const PartnershipTable = ({
  data,
  hasSearched,
  isLoading,
  onChangePage,
  onRowClick,
  page,
  perPage,
  totalCount,
}: Props) => {
  const NoRowsOverlay = () => (
    <PartnershipNoRowsOverlay hasSearched={hasSearched} />
  );

  const handleRowClick = (event: RowClickedEvent<PartnershipListItem>) => {
    if (!event.data) return;

    onRowClick(event.data);
  };

  return (
    <DataGrid<PartnershipListItem>
      className="gridTable w-full flex-1"
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
