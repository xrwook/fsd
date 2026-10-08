import { CancelIcon, SearchIcon } from "@/shared/assets/icons";
import { cn } from "@/shared/lib/tailwind";

interface Props {
  searchValue: string;
  onActive: () => void;
  onClear: () => void;
}

const SearchActionButton = ({
  searchValue,
  onActive: handleActive,
  onClear: handleSearchClear,
}: Props) => {
  if (searchValue) {
    return (
      <button
        className={cn("flex size-12 items-center justify-center rounded-full", {
          "focus:outline-offset-2": searchValue === "",
        })}
        style={searchValue === "" ? undefined : { outlineOffset: -2 }}
        type="button"
        onClick={handleSearchClear}
      >
        <CancelIcon className="text-icon-neutral-weakest" />
      </button>
    );
  }

  return (
    <button
      className={cn(
        "text-icon-neutral-weak hover:text-icon-neutral-stronger flex size-12 items-center justify-center rounded-full",
        { "focus:outline-offset-2": searchValue === "" },
      )}
      style={searchValue === "" ? { outlineOffset: -2 } : undefined}
      type="button"
      onClick={handleActive}
    >
      <SearchIcon className="" />
    </button>
  );
};

export default SearchActionButton;
