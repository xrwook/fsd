import { Button, Dropdown } from "@hae-fe/elements";

import { DataTableToolbarKr } from "@/shared/ui/layout";

import { PER_PAGE_OPTIONS } from "../model";

type Props = {
  onCreate: () => void;
  onPerPageChange: (size: number) => void;
  perPage: number;
  count: number;
  createDisabled?: boolean;
};

export const TermsTableToolbar = ({
  onCreate,
  onPerPageChange,
  perPage,
  count,
  createDisabled = false,
}: Props) => {
  return (
    <DataTableToolbarKr
      actions={
        <>
          <Button
            styleOption="outline"
            semantic="neutral"
            size="small"
            onClick={onCreate}
            disabled={createDisabled}
          >
            신규 등록
          </Button>
          <Dropdown
            className="ml-3 w-34.25"
            hdsProps={{ clearable: false, size: "small" }}
            onChange={(option) => {
              if (option && !Array.isArray(option)) {
                onPerPageChange(Number(option.value));
              }
            }}
            options={PER_PAGE_OPTIONS}
            value={PER_PAGE_OPTIONS.find((x) => Number(x.value) === perPage)}
          />
        </>
      }
      count={count}
    />
  );
};
