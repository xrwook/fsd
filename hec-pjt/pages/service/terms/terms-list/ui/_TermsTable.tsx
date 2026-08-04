import type { RowClickedEvent } from "ag-grid-community";

import { SCREEN_ID } from "@/shared/config";
import { navigateToScreen } from "@/shared/lib/navigation/navigation";
import DataGrid from "@/shared/ui/common-data-grid";

import { COLUMN_DEFS } from "../model";
import type { TermVersionListItem } from "../model/termsList";
import { TermsNoRowsOverlay } from "./_TermsNoRowsOverlay";

type Props = {
  hasSearched: boolean;
  onChangePage: (value: number) => void;
  page: number;
  totalCount: number;
  perPage: number;
  data?: TermVersionListItem[];
  isLoading: boolean;
};

const rowClassRules = {
  rowHoverable: () => true,
};

export const TermsTable = ({
  hasSearched,
  onChangePage,
  page,
  data,
  isLoading,
  totalCount,
  perPage,
}: Props) => {
  const NoRowsOverlay = () => <TermsNoRowsOverlay hasSearched={hasSearched} />;

  const onRowClick = (e: RowClickedEvent<TermVersionListItem>) => {
    navigateToScreen(SCREEN_ID.PLATFORMMGT.PFMT_POLICY_TERMS_DETAIL, {
      pathParams: {
        id: e.data?.id || "",
      },
    });
  };

  return (
    <DataGrid<TermVersionListItem>
      className="w-full flex-1"
      gridProps={{
        domLayout: "autoHeight",
        columnDefs: COLUMN_DEFS,
        rowData: data ?? [],
        rowClassRules,
        noRowsOverlayComponent: NoRowsOverlay,
        suppressRowClickSelection: true,
        loading: isLoading,
        onRowClicked: onRowClick,
      }}
      pagination={{
        onChangePage,
        page,
        count: Math.ceil(totalCount / Math.max(perPage, 1)),
      }}
    />
  );
};
