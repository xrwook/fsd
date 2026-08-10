import { Dropdown, type DropdownOption } from "@hae-fe/elements";

import { DataTableToolbarKr } from "@/shared/ui/layout";

import { PER_PAGE_OPTIONS } from "../model";

type Props = {
  count: number;
  onPerPageChange: (size: number) => void;
  perPage: number;
};

export const PartnershipTableToolbar = ({
  count,
  onPerPageChange,
  perPage,
}: Props) => {
  return (
    <DataTableToolbarKr
      count={count}
      actions={
        <>
          <Dropdown
            className="w-34.25"
            hdsProps={{ clearable: false, size: "small" }}
            options={PER_PAGE_OPTIONS}
            value={PER_PAGE_OPTIONS.find(
              (option) => Number(option.value) === perPage,
            )}
            onChange={(option: DropdownOption | DropdownOption[] | null) => {
              if (option && !Array.isArray(option)) {
                onPerPageChange(Number(option.value));
              }
            }}
          />
        </>
      }
    />
  );
};
