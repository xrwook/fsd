const FILTER_SEARCH_PARAM = "filter";

const toSearchString = (searchParams: URLSearchParams) => {
  const search = searchParams.toString();

  return search ? `?${search}` : "";
};

export const createFilterSearch = (search: string, filter: unknown) => {
  const searchParams = new URLSearchParams(search);
  const serializedFilter = JSON.stringify(filter);

  if (serializedFilter === undefined) {
    searchParams.delete(FILTER_SEARCH_PARAM);
  } else {
    searchParams.set(FILTER_SEARCH_PARAM, serializedFilter);
  }

  return toSearchString(searchParams);
};

export const parseFilterSearch = <Filter>(
  search: string,
  initialFilter: Filter,
) => {
  const serializedFilter = new URLSearchParams(search).get(
    FILTER_SEARCH_PARAM,
  );

  if (!serializedFilter) {
    return initialFilter;
  }

  try {
    return JSON.parse(serializedFilter) as Filter;
  } catch {
    return initialFilter;
  }
};

export const removeFilterSearch = (search: string) => {
  const searchParams = new URLSearchParams(search);

  searchParams.delete(FILTER_SEARCH_PARAM);

  return searchParams;
};

export const hasFilterSearch = (search: string) => {
  return new URLSearchParams(search).has(FILTER_SEARCH_PARAM);
};
