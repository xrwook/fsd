import { AutoCompleteSearch, Divider, TextButton } from "@hae-fe/elements";
import { IconRefresh } from "@hae-fe/icon-library/react";
import { DynamicFilter } from "@hae-fe/pattern";
import type { Dispatch, SetStateAction } from "react";
import {
  Controller,
  type ControllerRenderProps,
  useFormContext,
} from "react-hook-form";

import { DateRangePicker } from "@/shared/ui/date-range-picker";
import { CustomFilterSelect } from "@/shared/ui/select/CustomFilterSelect";

import {
  PARTNERSHIP_STATUS_ITEMS,
  QUICK_RANGE_OPTIONS,
  type PartnershipListFilterState,
} from "../model";

type Props = {
  onReset: () => void;
  setFilter: Dispatch<SetStateAction<PartnershipListFilterState>>;
};

export const PartnershipListFilter = ({ onReset, setFilter }: Props) => {
  const { control, getValues, watch } =
    useFormContext<PartnershipListFilterState>();

  const isFiltering =
    !!watch("searchWord") ||
    !!watch("requestStartAt") ||
    !!watch("requestEndAt") ||
    !!watch("confirmStartAt") ||
    !!watch("confirmEndAt") ||
    !!watch("processStatusCd");

  const handleSearch = () => {
    setFilter((prev) => ({
      ...prev,
      ...getValues(),
      page: 0,
    }));
  };

  const handleChangeFilter = (
    field: ControllerRenderProps<PartnershipListFilterState>,
    value: unknown,
  ) => {
    field.onChange(value);
    setFilter((prev) => ({
      ...prev,
      [field.name]: value,
      page: 0,
    }));
  };

  const handleDateRangeChange = (
    start: string,
    end: string,
    startField: ControllerRenderProps<PartnershipListFilterState>,
    endField: ControllerRenderProps<PartnershipListFilterState>,
  ) => {
    startField.onChange(start);
    endField.onChange(end);
    setFilter((prev) => ({
      ...prev,
      [startField.name]: start,
      [endField.name]: end,
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
              name="searchWord"
              render={({ field }) => (
                <AutoCompleteSearch
                  {...field}
                  className="max-w-175 min-w-50 flex-1 pr-1.5"
                  placeholder="회사명, 이름으로 검색"
                  size="small"
                  onSearch={handleSearch}
                />
              )}
            />
          </>,
          <Controller
            control={control}
            name="requestStartAt"
            render={({ field: startField }) => (
              <Controller
                control={control}
                name="requestEndAt"
                render={({ field: endField }) => (
                  <DateRangePicker
                    filterLabel="요청일"
                    inputVariant="filter"
                    quickRanges={QUICK_RANGE_OPTIONS}
                    startDate={startField.value || ""}
                    endDate={endField.value || ""}
                    onChange={(start, end) =>
                      handleDateRangeChange(start, end, startField, endField)
                    }
                  />
                )}
              />
            )}
          />,
          <Controller
            control={control}
            name="confirmStartAt"
            render={({ field: startField }) => (
              <Controller
                control={control}
                name="confirmEndAt"
                render={({ field: endField }) => (
                  <DateRangePicker
                    filterLabel="확인일"
                    inputVariant="filter"
                    quickRanges={QUICK_RANGE_OPTIONS}
                    startDate={startField.value || ""}
                    endDate={endField.value || ""}
                    onChange={(start, end) =>
                      handleDateRangeChange(start, end, startField, endField)
                    }
                  />
                )}
              />
            )}
          />,
          <Controller
            control={control}
            name="processStatusCd"
            render={({ field }) => (
              <CustomFilterSelect
                value={field.value}
                placeholder="전체"
                hdsProps={{
                  labelText: "처리 상태:",
                  items: PARTNERSHIP_STATUS_ITEMS,
                  multiple: false,
                }}
                onChange={(value: unknown) => handleChangeFilter(field, value)}
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
