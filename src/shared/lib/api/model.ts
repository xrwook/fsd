import type { SortDirection } from "@/shared/lib/types";

// TODO: 추후 BE 협의 후 변경 필요
type AllowedKeys = "path" | "query" | "requestBody" | "paging";

/** API 요청 파라미터 형식 */
export type Request<
  T extends Partial<Record<AllowedKeys, unknown>> & {
    [K in keyof T]: K extends AllowedKeys ? T[K] : never;
  },
> = T;

/** AG Grid ColumnState 정렬 아이템 형식 */
export type SortItem<T extends string = string> = {
  colId: T;
  sort: Lowercase<SortDirection> | null;
  sortIndex?: number | null;
};

type PagingRequestParams<T extends string = string> = {
  /** 페이지 번호 */
  page?: number;
  /** 페이지 크기 */
  pageSize: number;
  /** 정렬 조건 (단일 또는 다중) */
  sort?: SortItem<T> | SortItem<T>[];
};

/** API 페이징 요청 형식 */
export type PagingRequest<
  T extends Partial<Record<AllowedKeys, unknown>> & {
    [K in keyof T]: K extends "paging"
      ? PagingRequestParams<TOrderCol>
      : K extends AllowedKeys
        ? T[K]
        : never;
  },
  TOrderCol extends string = string,
> = T & {
  paging: PagingRequestParams<TOrderCol>;
};

/** API 공통 응답 형식 */
export type Response<T> = {
  trace: string;
  code: string;
  message: string;
  data: T;
};

type PagingResponseInfo = {
  /** 전체 데이터 수 */
  totalCount: number;
  /** 전체 페이지 수 */
  totalPage: number;
  /** 현재 페이지 번호 */
  page: number;
  /** 페이지 크기 */
  size: number;
};

/**
 * API 페이징 응답 형식
 * @template T - 데이터 타입
 * @template TExtra - 페이징 정보와 같은 계위에 추가되는 필드 (예: { lastModifyDate: string })
 */
type PagingResponseData<T, TExtra extends object = object> =
  PagingResponseInfo &
    TExtra & {
      content: T[];
    };

/**
 * API 페이징 응답 전체 형식 (Response 래퍼 포함)
 * @template T - 데이터 타입
 * @template TExtra - 페이징 정보와 같은 계위에 추가되는 필드 (예: { lastModifyDate: string })
 */
export type PagingResponse<T, TExtra extends object = object> = Response<
  PagingResponseData<T, TExtra>
>;
