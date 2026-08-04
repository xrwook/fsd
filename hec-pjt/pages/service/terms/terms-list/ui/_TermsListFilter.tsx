import { AutoCompleteSearch, Divider, TextButton } from "@hae-fe/elements";
import { IconRefresh } from "@hae-fe/icon-library/react";
import { DynamicFilter } from "@hae-fe/pattern";
import { type Dispatch, type SetStateAction } from "react";
import {
  Controller,
  type ControllerRenderProps,
  useFormContext,
} from "react-hook-form";

import { toUtcStartOfDay } from "@/shared/lib/date";
import type { QuickRange } from "@/shared/ui/date-range-picker";
import { DateRangePicker } from "@/shared/ui/date-range-picker";
import { CustomFilterSelect } from "@/shared/ui/select/CustomFilterSelect";

import { REQUIRED_FILTER_ITEMS, type TermsListFilterState } from "../model";

type Props = {
  onReset: () => void;
  setFilter: Dispatch<SetStateAction<TermsListFilterState>>;
};

const quickRange: QuickRange[] = [{ label: "전체", type: "all" }];

export const TermsListFilter = ({ onReset, setFilter }: Props) => {
  const { control, getValues, watch } = useFormContext<TermsListFilterState>();

  const isFiltering =
    !!watch("revisionReason") ||
    watch("isRequired") !== "" ||
    !!watch("deployDate");

  const handleChangeFilter = (
    field: ControllerRenderProps<TermsListFilterState>,
    value: unknown,
  ) => {
    field.onChange(value);

    setFilter((prev) => ({
      ...prev,
      [field.name]: value,
      page: 0,
      size: 15,
    }));
  };

  const handleSearch = () => {
    const values = getValues();

    setFilter((prev) => ({
      ...prev,
      revisionReason: values.revisionReason,
      isRequired: values.isRequired,
      deployDate: values.deployDate ? toUtcStartOfDay(values.deployDate) : "",
      page: 0,
    }));
  };

  const handleDeployDateChange = (
    start: string,
    end: string,
    field: ControllerRenderProps<TermsListFilterState>,
  ) => {
    const nextDate = start || end;
    field.onChange(nextDate);

    setFilter((prev) => ({
      ...prev,
      deployDate: nextDate ? toUtcStartOfDay(nextDate) : "",
      page: 0,
    }));
  };

  return (
    <div className="flex items-center">
      <DynamicFilter
        fieldContainer={[
          <>
            <Controller
              control={control}
              name="revisionReason"
              render={({ field }) => (
                <AutoCompleteSearch
                  {...field}
                  className="max-w-175 min-w-50 flex-1 pr-1.5"
                  placeholder="개정 사유를 검색해 주세요."
                  size="small"
                  onSearch={handleSearch}
                />
              )}
            />
          </>,
          <Controller
            control={control}
            name="isRequired"
            render={({ field }) => (
              <CustomFilterSelect
                value={field.value}
                placeholder="전체"
                hdsProps={{
                  labelText: "동의 구분:",
                  items: REQUIRED_FILTER_ITEMS,
                  multiple: false,
                }}
                onChange={(value) => handleChangeFilter(field, value)}
              />
            )}
          />,
          <Controller
            control={control}
            name="deployDate"
            render={({ field }) => (
              <DateRangePicker
                filterLabel="게시일"
                inputType="filter"
                startDate={field.value || ""}
                endDate={field.value || ""}
                quickRangeOptions={quickRange}
                onChange={(start, end) =>
                  handleDeployDateChange(start, end, field)
                }
              />
            )}
          />,
        ]}
      />

      {isFiltering && (
        <>
          <Divider orientation="vertical" className="mx-2.75 my-2.5 h-3 w-px" />
          <TextButton
            size="medium"
            semantic="brand"
            underline={false}
            iconLeft={<IconRefresh size={16} type="outline" />}
            onClick={onReset}
          >
            초기화
          </TextButton>
        </>
      )}
    </div>
  );
};
