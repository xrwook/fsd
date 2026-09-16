import { Pagination } from '@hae-fe/elements';

export type Props = {
  onChangePage: (page: number) => void;
  page: number;
  count: number;
  className?: string;
};

const DataGridPagination = ({ count, page, className = 'mt-3', onChangePage }: Props) => {
  return (
    <Pagination
      className={className}
      hdsProps={{
        button: true,
      }}
      count={count}
      onChange={(_event, value) => onChangePage(Math.max(value - 1, 0))}
      page={Math.max(page + 1, 1)}
    />
  );
};

export default DataGridPagination;
