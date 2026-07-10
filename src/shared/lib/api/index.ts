import type {
  AxiosRequestConfig,
  AxiosRequestHeaders,
  AxiosResponse,
  Method,
} from "axios";

import type { AliasAny, ExtractPathParams } from "@/shared/lib/types";

import axiosInstance from "./axiosInstance";
import { PATH_PARAM_REGEX } from "./constants";
import type {
  PagingRequestParams,
  Response as ApiResponse,
  SortItem,
} from "./model";

export { SCREEN_ID_HEADER } from "./constants";
export type {
  PagingRequest,
  PagingRequestParams,
  PagingResponse,
  Request,
  Response,
  SortItem,
} from "./model";
export {
  clearRequestScreenId,
  getRequestScreenId,
  setRequestScreenId,
} from "./requestContext";

type RequestParams = {
  path?: Record<string, AliasAny>;
  query?: Record<string, AliasAny>;
  paging?: PagingRequestParams;
  requestBody?: AliasAny;
};

// 누락된 키 체크
type MissingParams<Url extends string, Request extends RequestParams> = Exclude<
  ExtractPathParams<Url>,
  keyof NonNullable<Request["path"]>
>;

type ValidatePathParams<
  Url extends string,
  Request extends RequestParams,
> = MissingParams<Url, Request> extends never
  ? Url
  : PathParamError<MissingParams<Url, Request>>;

type Payload<T extends RequestParams> = T & {
  headers?: AxiosRequestHeaders;
  signal?: AbortSignal;
};

type PathParamError<Missing extends string> =
  `[타입오류] request.path에 '${Missing}' 값이 없습니다`;

const isSortItem = (value: unknown): value is SortItem =>
  typeof value === "object" &&
  value !== null &&
  "colId" in value &&
  "sort" in value;

const serializeQueryParams = (
  query: Record<string, AliasAny>,
): Record<string, AliasAny> => {
  if (!("sort" in query)) return query;

  const rawSort = query["sort"];
  const rawSortArray = Array.isArray(rawSort) ? rawSort : [rawSort];
  const sortItems = rawSortArray.filter((item) => isSortItem(item));

  const filteredSorts = sortItems.filter(
    (sortItem): sortItem is SortItem & { sort: NonNullable<SortItem["sort"]> } =>
      sortItem.sort !== null,
  );

  if (filteredSorts.length === 0) return query;

  // tsconfig lib 기준에서 Array#toSorted를 사용할 수 없어 복사 후 sort를 사용합니다.
  // eslint-disable-next-line unicorn/no-array-sort
  const orderedSorts = [...filteredSorts].sort(
    (a, b) => (a.sortIndex ?? 0) - (b.sortIndex ?? 0),
  );
  const serializedSorts = orderedSorts.map(
    ({ colId, sort }) => `${colId},${sort}`,
  );

  return { ...query, sort: serializedSorts };
};

/** sort 배열을 repeated key로 직렬화 (sort=a,asc&sort=b,desc) */
const paramsSerializer = (params: Record<string, AliasAny>): string => {
  const result = new URLSearchParams();

  for (const [key, value] of Object.entries(params)) {
    if (value == null) continue;

    if (Array.isArray(value)) {
      for (const item of value as unknown[]) {
        result.append(key, String(item));
      }
    } else {
      result.append(key, String(value));
    }
  }

  return result.toString();
};

/** query와 paging을 하나의 URL query parameter 객체로 합친다. */
const getRequestQueryParams = (
  query?: Record<string, AliasAny>,
  paging?: PagingRequestParams,
): Record<string, AliasAny> | undefined => {
  if (!query && !paging) {
    return;
  }

  const requestParams: Record<string, AliasAny> = {
    ...query,
    ...paging,
  };

  return serializeQueryParams(requestParams);
};

export const apiRequest = <
  ApiResponseType extends ApiResponse<unknown>,
  Request extends RequestParams = RequestParams,
  Url extends string = string,
>(
  method: Method,
  url: ValidatePathParams<Url, Request>,
  payload?: Payload<Request>,
  extraConfig?: Pick<AxiosRequestConfig, "screenId" | "skipScreenId">,
): Promise<AxiosResponse<ApiResponseType>> => {
  const { path, query, paging, requestBody, headers, signal } = payload ?? {};
  const requestQuery = getRequestQueryParams(query, paging);

  const config: AxiosRequestConfig = {
    method,
    url: replaceUrlPathParams(url, path),
    // GET 계열 요청의 query string 처리: query와 paging을 함께 URL 파라미터로 전달한다.
    params: requestQuery,
    paramsSerializer,
    // POST/PUT 계열 요청의 body
    data: requestBody,
    headers,
    signal,
    ...extraConfig,
  };

  return axiosInstance<ApiResponseType>(config);
};

export const replaceUrlPathParams = (
  apiUrl: string,
  path?: Record<string, AliasAny>,
) => {
  return path
    ? apiUrl.replaceAll(PATH_PARAM_REGEX, (_, colonKey, braceKey) => {
        const key = colonKey || braceKey;
        const value = path[key];

        if (value === undefined) {
          console.error(`${apiUrl} '${key}' is missing in path`);
        }

        return String(value);
      })
    : apiUrl;
};
