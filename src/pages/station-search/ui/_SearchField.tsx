import { debounce } from "lodash-es";
import { useEffect, useMemo, useRef, useState } from "react";

import { cn } from "@/shared/lib/tailwind";
import { Divider } from "@/shared/ui/divider";

import {
  type LocationItem,
  type LocationsRequest,
  useGetLocationsQuery,
} from "../api/locations";
import SearchActionButton from "./_SearchActionButton";
import SearchResultList from "./_SearchResultList";

interface Props {
  center: { lat: number; lng: number };
  onSubmit: (location: LocationItem) => void;
}

const SEARCH_DEBOUNCE_MS = 300;

const SearchField = ({ center, onSubmit: handleOnSubmit }: Props) => {
  const searchInput = useRef<HTMLInputElement>(null);
  const [searchValue, setSearchValue] = useState("");
  const [isSearch, setIsSearch] = useState(false);
  const [searchKeyword, setSearchKeyword] = useState("");

  const debouncedSetSearchKeyword = useMemo(
    () => debounce(setSearchKeyword, SEARCH_DEBOUNCE_MS),
    [],
  );

  useEffect(() => {
    debouncedSetSearchKeyword(searchValue.trim());

    return () => {
      debouncedSetSearchKeyword.cancel();
    };
  }, [debouncedSetSearchKeyword, searchValue]);

  const searchRequest = useMemo<LocationsRequest>(
    () => ({
      query: {
        page: 0,
        size: 20,
        sort: ["distanceMeters,ASC"],
      },
      requestBody: {
        latitude: center.lat,
        longitude: center.lng,
        keywordSearch: {
          searchType: "L",
          text: searchKeyword,
        },
      },
    }),
    [center.lat, center.lng, searchKeyword],
  );

  const { data: searchResponse } = useGetLocationsQuery(
    searchRequest,
    isSearch && Boolean(searchKeyword),
  );
  const searchResults = searchResponse?.data.content ?? [];

  const handleActive = () => {
    setIsSearch(true);
    searchInput.current?.focus();
  };

  const handleClear = () => {
    setSearchValue("");
    searchInput.current?.focus();
  };

  const handleSelect = (location: LocationItem) => {
    setSearchValue(location.name);
    setIsSearch(false);
    handleOnSubmit(location);
  };

  return (
    <div
      className={cn(
        "bg-background-white absolute top-18 left-4 z-1 max-w-[calc(100vw-32px)] rounded-3xl shadow-[0_2px_4px_0_rgba(0,0,0,0.06)] duration-300 md:top-26 md:left-10 md:max-w-100 lg:top-26 lg:left-10 xl:top-32 xl:left-16",
        { "overflow-hidden": isSearch },
      )}
    >
      <div className="flex">
        <div
          className={cn(
            "w-0 origin-left overflow-hidden py-3 transition-[width] duration-300 ease-in-out",
            { "w-81 pl-6": isSearch },
          )}
        >
          <input
            className="typo-body-2 placeholder:text-text-neutral-weaker text-text-neutral-stronger w-full font-medium outline-0"
            id=""
            name=""
            placeholder="충전소 혹은 주소를 입력해주세요."
            ref={searchInput}
            type="text"
            value={searchValue}
            onChange={(event) => setSearchValue(event.target.value)}
          />
        </div>
        <div className="inline-flex items-center justify-center">
          <SearchActionButton
            searchValue={searchValue}
            onActive={handleActive}
            onClear={handleClear}
          />
        </div>
      </div>

      {isSearch && searchValue && (
        <>
          <Divider />
          <div className="bg-background-white scrollbar-custom max-h-90 overflow-hidden overflow-y-auto pb-5">
            <ul>
              {searchResults.map((location) => (
                <SearchResultList
                  key={location.locationId}
                  keyword={searchKeyword}
                  search={location}
                  onClick={() => handleSelect(location)}
                />
              ))}
            </ul>
          </div>
        </>
      )}
    </div>
  );
};

export default SearchField;
