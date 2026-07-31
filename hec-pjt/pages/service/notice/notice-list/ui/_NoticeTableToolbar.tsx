import { Dropdown } from '@hae-fe/elements';

import { DataTableToolbarKr } from '@/shared/ui/layout';

import { PER_PAGE_OPTIONS } from '../model';

type Props = {
  onPerPageChange: (size: number) => void;
  perPage: number;
  count: number;
};

export const NoticeTableToolbar = ({ onPerPageChange, perPage, count }: Props) => {
  return (
    <DataTableToolbarKr
      actions={
        <>
          <Dropdown
            className="w-34.25"
            hdsProps={{ clearable: false, size: 'small' }}
            onChange={option => {
              if (option && !Array.isArray(option)) {
                onPerPageChange(Number(option.value));
              }
            }}
            options={PER_PAGE_OPTIONS}
            value={PER_PAGE_OPTIONS.find(x => Number(x.value) === perPage)}
          />
        </>
      }
      count={count}
    />
  );
};
