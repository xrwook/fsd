import type { RowClickedEvent } from 'ag-grid-community';

import { SCREEN_ID } from '@/shared/config';
import { navigateToScreen } from '@/shared/lib/navigation/navigation';
import DataGrid from '@/shared/ui/common-data-grid';

import { COLUMN_DEFS } from '../model';
import type { NoticeListItem } from '../model/noticeList';
import { NoticeNoRowsOverlay } from './_NoticeNoRowsOverlay';

type Props = {
  hasSearched: boolean;
  onChangePage: (value: number) => void;
  page: number;
  totalCount: number;
  perPage: number;
  data?: NoticeListItem[];
  isLoading: boolean;
};

const rowClassRules = {
  rowHoverable: () => true,
};

export const NoticeTable = ({ hasSearched, onChangePage, page, data, isLoading, totalCount, perPage }: Props) => {
  const NoRowsOverlay = () => <NoticeNoRowsOverlay hasSearched={hasSearched} />;

  const onRowClick = (e: RowClickedEvent<NoticeListItem>) => {
    navigateToScreen(SCREEN_ID.PLATFORMMGT.PFMT_CS_NTC_DETAIL, {
      pathParams: {
        id: e.data?.id || '',
      },
    });
  };

  return (
    <>
      <DataGrid<NoticeListItem>
        className="w-full flex-1"
        gridProps={{
          domLayout: 'autoHeight',
          columnDefs: COLUMN_DEFS,
          rowData: data ?? [],
          rowClassRules: rowClassRules,
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
    </>
  );
};
