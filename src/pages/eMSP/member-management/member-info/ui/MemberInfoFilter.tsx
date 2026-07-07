import { Button, Stack, TextField } from "@mui/material";
import { useEffect, useEffectEvent, useRef } from "react";

import { useUrlSearchParams } from "@/shared/lib/router";
import { DateRangePicker } from "@/shared/ui/date-range-picker";

import {
  INITIAL_MEMBER_FILTER_STATE,
  type MemberFilterState,
} from "../model/member";

type Props = {
  onReset: () => void;
  onSearch: (filter: MemberFilterState) => void;
};

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
        onChange={(startDate, endDate) =>
          setFilter((previous) => ({
            ...previous,
            endDate,
            startDate,
          }))
        }
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
