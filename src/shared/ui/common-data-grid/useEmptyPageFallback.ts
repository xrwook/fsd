import { useEffect, useRef } from 'react';

type Props<TData extends object> = {
  rowData?: TData[];
  loading?: boolean;
  /** 삭제 후 재조회, 페이지 전환을 포함한 데이터 조회 상태입니다. */
  isFetching?: boolean;
  isError?: boolean;
  page?: number;
  onChangePage?: (page: number) => void;
};

export const useEmptyPageFallback = <TData extends object>({
  rowData,
  loading,
  isFetching,
  isError,
  page,
  onChangePage,
}: Props<TData>) => {
  const requestedPage = useRef<number | undefined>(undefined);
  const rowCount = rowData?.length;

  useEffect(() => {
    if (page === undefined || page <= 0 || (rowCount !== undefined && rowCount > 0)) {
      requestedPage.current = undefined;
      return;
    }

    // 조회 전/조회 중/오류 상태의 빈 데이터로는 페이지를 이동하지 않습니다.
    if (loading || isFetching || isError || rowCount !== 0 || !onChangePage) return;

    // StrictMode 및 부모 재렌더링으로 같은 페이지의 이동을 중복 요청하지 않습니다.
    if (requestedPage.current === page) return;
    requestedPage.current = page;
    onChangePage(page - 1);
  }, [rowCount, loading, isFetching, isError, page, onChangePage]);
};
