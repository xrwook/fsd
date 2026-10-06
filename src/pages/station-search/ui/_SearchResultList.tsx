import { HighlightText } from "@/shared/ui/highlight-text";

import type { SearchStationResultProps } from "../model/station-search";

interface Props {
  search: SearchStationResultProps;
  keyword: string;
  onClick: () => void;
}

const SearchResultList = ({ search, keyword, onClick: handleClick }: Props) => {
  return (
    <li className="w-full">
      <button
        className="hover:bg-state-hovered-on-light w-full px-6 py-4 text-left"
        type="button"
        onClick={handleClick}
      >
        <p className="typo-body-2 text-text-neutral-stronger font-medium">
          <HighlightText keyword={keyword} text={search.name} />
        </p>
        <p className="typo-body-3 text-text-neutral-weaker mt-1 font-normal">{search.address}</p>
      </button>
    </li>
  );
};

export default SearchResultList;
