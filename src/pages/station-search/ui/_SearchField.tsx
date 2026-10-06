import { useRef } from "react";

import { cn } from "@/shared/lib/tailwind";
import { Divider } from "@/shared/ui/divider";

import { StationSearchMock } from "../mock/station-search";
import SearchActionButton from "./_SearchActionButton";
import SearchResultList from "./_SearchResultList";

interface Props {
  searchValue: string;
  onChange: (newValue: string) => void;
  onClear: () => void;
  onSubmit: (newValue: string) => void;
  onSearch: (newValue: boolean) => void;
  isSearch: boolean;
}

const SearchField = ({
  searchValue,
  onChange: handleChange,
  onClear,
  onSubmit: handleOnSubmit,
  isSearch,
  onSearch,
}: Props) => {
  const searchInput = useRef<HTMLInputElement>(null);

  const handleIsSearch = (newValue: boolean) => {
    onSearch(newValue);
    searchInput.current?.focus();
  };

  const handleClear = () => {
    onClear();
    searchInput.current?.focus();
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
            onChange={(event) => handleChange(event.target.value)}
          />
        </div>
        <div className="inline-flex items-center justify-center">
          <SearchActionButton
            searchValue={searchValue}
            onActive={() => handleIsSearch(true)}
            onClear={() => handleClear()}
          />
        </div>
      </div>

      {searchValue && (
        <>
          <Divider />
          <div className="bg-background-white scrollbar-custom max-h-90 overflow-hidden overflow-y-auto pb-5">
            <ul>
              {StationSearchMock.map((item) => (
                <SearchResultList
                  key={item.id}
                  keyword={searchValue}
                  search={item}
                  onClick={() => handleOnSubmit(item.name)}
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
