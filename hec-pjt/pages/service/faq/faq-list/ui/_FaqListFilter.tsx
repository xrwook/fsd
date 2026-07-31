import { AutoCompleteSearch, Divider, TextButton } from "@hae-fe/elements";
import { IconRefresh } from "@hae-fe/icon-library/react";
import { DynamicFilter } from "@hae-fe/pattern";
import { type Dispatch, type SetStateAction } from "react";
import {
  Controller,
  type ControllerRenderProps,
  useFormContext,
} from "react-hook-form";

import { FAQ_PUBLISH_STATUS } from "@/features/faq-form/model/constant";
import { toUtcEndOfDay, toUtcStartOfDay } from "@/shared/lib/date";
import type { QuickRange } from "@/shared/ui/date-range-picker";
import { DateRangePicker } from "@/shared/ui/date-range-picker";
import { CustomFilterSelect } from "@/shared/ui/select/CustomFilterSelect";

import { AllItem, type FaqListFilterState } from "../model";

type Props = {
  onReset: () => void;
  setFilter: Dispatch<SetStateAction<FaqListFilterState>>;
};

const suggestions = ["회원가입", "충전소", "요금", "결제", "E-pit", "PASS"];

const publishStatusItems = [
  AllItem,
  ...FAQ_PUBLISH_STATUS.map((item: { label: string; value: string }) => ({
    label: item.label,
    value: item.value,
  })),
];

const quickRange: QuickRange[] = [
  { label: "전체", type: "all" },
  { amount: 7, label: "1주", unit: "days" },
  { amount: 1, label: "1개월", unit: "months" },
  { amount: 3, label: "3개월", unit: "months" },
  { amount: 6, label: "6개월", unit: "months" },
  { amount: 12, label: "1년", unit: "months" },
];

export const FaqListFilter = ({ onReset, setFilter }: Props) => {
  const { control, getValues, watch } = useFormContext<FaqListFilterState>();

  const isFiltering =
    !!watch("searchKeyword") ||
    !!watch("searchPublishType") ||
    !!watch("searchStartPublishedAt") ||
    !!watch("searchEndPublishedAt");

  const handleChangeFilter = (
    field: ControllerRenderProps<FaqListFilterState>,
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
    setFilter((prev) => ({
      ...prev,
      ...getValues(),
      page: 0,
    }));
  };

  const handleDateRangeChange = (
    start: string,
    end: string,
    startField: ControllerRenderProps<FaqListFilterState>,
    endField: ControllerRenderProps<FaqListFilterState>,
  ) => {
    startField.onChange(start);
    endField.onChange(end);

    setFilter((prev) => ({
      ...prev,
      searchStartPublishedAt: toUtcStartOfDay(start),
      searchEndPublishedAt: toUtcEndOfDay(end),
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
              name="searchKeyword"
              render={({ field }) => (
                <AutoCompleteSearch
                  {...field}
                  className="max-w-175 min-w-50 flex-1 pr-1.5"
                  placeholder="질문을 검색해 주세요."
                  size="small"
                  suggestions={suggestions}
                  onSearch={handleSearch}
                />
              )}
            />
          </>,
          <Controller
            control={control}
            name="searchPublishType"
            render={({ field }) => (
              <CustomFilterSelect
                value={field.value}
                placeholder="전체"
                hdsProps={{
                  labelText: "게시 상태:",
                  items: publishStatusItems,
                  multiple: false,
                }}
                onChange={(value) => handleChangeFilter(field, value)}
              />
            )}
          />,
          <Controller
            control={control}
            name="searchStartPublishedAt"
            render={({ field: startField }) => (
              <Controller
                control={control}
                name="searchEndPublishedAt"
                render={({ field: endField }) => (
                  <DateRangePicker
                    filterLabel="기간"
                    inputType="filter"
                    startDate={startField.value || ""}
                    endDate={endField.value || ""}
                    quickRangeOptions={quickRange}
                    onChange={(start, end) =>
                      handleDateRangeChange(start, end, startField, endField)
                    }
                  />
                )}
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
