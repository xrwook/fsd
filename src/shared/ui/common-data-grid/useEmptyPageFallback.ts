import { useEffect, useRef } from 'react';

type Props<TData extends object> = {
  rowData?: TData[];
  loading?: boolean;
  /** 삭제 후 재조회, 페이지 전환을 포함한 데이터 조회 상태입니다. */
  isFetching?: boolean;
  isError?: boolean;
  page?: number;
  /** 재조회 결과를 기준으로 계산한 전체 페이지 수입니다. */
  count?: number;
  onChangePage?: (page: number) => void;
};

export const useEmptyPageFallback = <TData extends object>({
  rowData,
  loading,
  isFetching,
  isError,
  page,
  count,
  onChangePage,
}: Props<TData>) => {
  const requestedPage = useRef<{ page: number; targetPage: number } | undefined>(undefined);
  const rowCount = rowData?.length;

  useEffect(() => {
    if (page === undefined || page <= 0 || (rowCount !== undefined && rowCount > 0)) {
      requestedPage.current = undefined;
      return;
    }

    // 조회 전/조회 중/오류 상태의 빈 데이터로는 페이지를 이동하지 않습니다.
    if (loading || isFetching || isError || rowCount !== 0 || !onChangePage) return;

    // 여러 페이지가 삭제되었으면 마지막 유효 페이지로 한 번에 이동합니다.
    const targetPage = count === undefined ? page - 1 : Math.min(page - 1, Math.max(count - 1, 0));

    // StrictMode 및 부모 재렌더링으로 같은 이동을 중복 요청하지 않습니다.
    if (requestedPage.current?.page === page && requestedPage.current.targetPage === targetPage) return;
    requestedPage.current = { page, targetPage };
    onChangePage(targetPage);
  }, [rowCount, loading, isFetching, isError, page, count, onChangePage]);
};
