import { Button, Stack, TextField } from "@mui/material";
import { useEffect, useEffectEvent, useRef } from "react";

import { useUrlSearchParams } from "@/shared/lib/router";
import {
  DateRangePicker,
  type DateRangeQuickRange,
} from "@/shared/ui/date-range-picker";

import {
  INITIAL_MEMBER_FILTER_STATE,
  type MemberFilterState,
} from "../model/member";

type Props = {
  onReset: () => void;
  onSearch: (filter: MemberFilterState) => void;
};

const MEMBER_DATE_QUICK_RANGES: DateRangeQuickRange[] = [
  {
    label: "전체",
    type: "all",
  },
  {
    amount: 7,
    label: "1주",
    unit: "days",
  },
  {
    amount: 1,
    label: "1개월",
    unit: "months",
  },
  {
    amount: 3,
    label: "3개월",
    unit: "months",
  },
  {
    amount: 6,
    label: "6개월",
    unit: "months",
  },
  {
    amount: 12,
    label: "1년",
    unit: "months",
  },
];

export const MemberInfoFilter = ({ onReset, onSearch }: Props) => {
  const [filter, setFilter] = useUrlSearchParams<MemberFilterState>(
    INITIAL_MEMBER_FILTER_STATE,
  );
  const notifySearch = useEffectEvent(onSearch);
  const restoredFilterRef = useRef(filter);
  const didNotifyRestoredFilterRef = useRef(false);

  useEffect(() => {
    if (didNotifyRestoredFilterRef.current) {
      return;
    }

    didNotifyRestoredFilterRef.current = true;
    notifySearch(restoredFilterRef.current);
  }, []);

  const handleReset = () => {
    setFilter(INITIAL_MEMBER_FILTER_STATE);
    onReset();
  };

  return (
    <Stack spacing={1}>
      <DateRangePicker
        endDate={filter.endDate}
        filterLabel="기간"
        inputVariant="filter"
        onChange={(startDate, endDate) =>
          setFilter((previous) => ({
            ...previous,
            endDate,
            startDate,
          }))
        }
        quickRanges={MEMBER_DATE_QUICK_RANGES}
        quickRangeDirection="future"
        startDate={filter.startDate}
        disabledRanges={[
          {
            startDate: "2026-06-30",
            endDate: "2026-05-30",
          },
        ]}
      />

      <TextField
        label="회원명"
        onChange={(event) =>
          setFilter((previous) => ({
            ...previous,
            keyword: event.target.value,
          }))
        }
        size="small"
        value={filter.keyword}
      />

      <Stack direction="row" spacing={1}>
        <Button
          onClick={() => notifySearch(filter)}
          type="button"
          variant="contained"
        >
          조회
        </Button>
        <Button onClick={handleReset} type="button" variant="outlined">
          초기화
        </Button>
      </Stack>
    </Stack>
  );
};
