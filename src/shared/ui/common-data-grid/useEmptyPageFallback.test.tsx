import { cleanup, renderHook } from '@testing-library/react';
import { StrictMode } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { useEmptyPageFallback } from './useEmptyPageFallback';

afterEach(cleanup);

describe('useEmptyPageFallback', () => {
  it('삭제 후 빈 배열이 되면 이전 페이지를 요청한다', () => {
    const onChangePage = vi.fn();
    const { rerender } = renderHook(
      ({ rowData }) => useEmptyPageFallback({ rowData, page: 2, onChangePage }),
      { initialProps: { rowData: [{ id: 1 }] } },
    );

    expect(onChangePage).not.toHaveBeenCalled();
    rerender({ rowData: [] });
    expect(onChangePage).toHaveBeenCalledExactlyOnceWith(1);
  });

  it.each([
    { page: 0, rowData: [] },
    { page: undefined, rowData: [] },
    { page: 1, rowData: undefined },
    { page: 1, rowData: [], loading: true },
    { page: 1, rowData: [], loading: false, isFetching: true },
    { page: 1, rowData: [], isError: true },
    { page: 1, rowData: [{ id: 1 }] },
  ])('이동할 수 없는 상태에서는 유지한다: %j', (props) => {
    const onChangePage = vi.fn();
    renderHook(() => useEmptyPageFallback({ ...props, onChangePage }));
    expect(onChangePage).not.toHaveBeenCalled();
  });

  it('재조회가 완료된 빈 배열에 대해서만 이동한다', () => {
    const onChangePage = vi.fn();
    const { rerender } = renderHook(
      ({ loading }) => useEmptyPageFallback({ rowData: [], page: 1, loading, onChangePage }),
      { initialProps: { loading: true } },
    );

    expect(onChangePage).not.toHaveBeenCalled();
    rerender({ loading: false });
    expect(onChangePage).toHaveBeenCalledExactlyOnceWith(0);
  });

  it('isFetching이 종료된 후에도 데이터가 비어 있으면 이동한다', () => {
    const onChangePage = vi.fn();
    const { rerender } = renderHook(
      ({ isFetching }) => useEmptyPageFallback({ rowData: [], page: 1, loading: false, isFetching, onChangePage }),
      { initialProps: { isFetching: true } },
    );

    expect(onChangePage).not.toHaveBeenCalled();
    rerender({ isFetching: false });
    expect(onChangePage).toHaveBeenCalledExactlyOnceWith(0);
  });

  it('StrictMode와 콜백 변경에도 동일한 이동을 중복 요청하지 않는다', () => {
    const onChangePage = vi.fn();
    const { rerender } = renderHook(
      ({ callback }) => useEmptyPageFallback({ rowData: [], page: 1, onChangePage: callback }),
      { initialProps: { callback: onChangePage }, wrapper: StrictMode },
    );
    const nextCallback = vi.fn();
    rerender({ callback: nextCallback });

    expect(onChangePage).toHaveBeenCalledExactlyOnceWith(0);
    expect(nextCallback).not.toHaveBeenCalled();
  });

  it('이전 페이지도 조회 후 비어 있으면 한 페이지 더 이동한다', () => {
    const onChangePage = vi.fn();
    const { rerender } = renderHook(
      (props) => useEmptyPageFallback({ ...props, rowData: [], onChangePage }),
      { initialProps: { page: 2, loading: false } },
    );

    rerender({ page: 1, loading: true });
    expect(onChangePage).toHaveBeenCalledTimes(1);
    rerender({ page: 1, loading: false });
    expect(onChangePage).toHaveBeenNthCalledWith(2, 0);
    rerender({ page: 0, loading: false });
    expect(onChangePage).toHaveBeenCalledTimes(2);
  });

  it('데이터가 채워진 후 다시 삭제되면 같은 페이지에서도 다시 이동한다', () => {
    const onChangePage = vi.fn();
    const { rerender } = renderHook(
      ({ rowData }: { rowData: object[] }) => useEmptyPageFallback({ rowData, page: 1, onChangePage }),
      { initialProps: { rowData: [] as object[] } },
    );

    rerender({ rowData: [{ id: 1 }] });
    rerender({ rowData: [] });
    expect(onChangePage).toHaveBeenCalledTimes(2);
  });
});
