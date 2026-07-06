import { Button, Stack, TextField } from "@mui/material";
import type { SyntheticEvent } from "react";
import { useEffect, useState } from "react";

import {
  INITIAL_MEMBER_FILTER_STATE,
  type MemberFilterState,
} from "../model/member";

type Props = {
  initialFilter: MemberFilterState;
  onReset: () => void;
  onSearch: (filter: MemberFilterState) => void;
};

export const MemberInfoFilter = ({
  initialFilter,
  onReset,
  onSearch,
}: Props) => {
  const [filter, setFilter] = useState(initialFilter);

  useEffect(() => {
    setFilter(initialFilter);
  }, [initialFilter]);

  const handleSearch = (event: SyntheticEvent<HTMLFormElement>) => {
    event.preventDefault();
    onSearch(filter);
  };

  const handleReset = () => {
    setFilter(INITIAL_MEMBER_FILTER_STATE);
    onReset();
  };

  return (
    <Stack
      component="form"
      direction={{ xs: "column", sm: "row" }}
      onSubmit={handleSearch}
      spacing={1}
    >
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
      <Button type="submit" variant="contained">
        조회
      </Button>
      <Button onClick={handleReset} type="button" variant="outlined">
        초기화
      </Button>
    </Stack>
  );
};
