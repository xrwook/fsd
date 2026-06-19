import { zodResolver } from "@hookform/resolvers/zod";
import { Box, Button, Stack, TextField, Typography } from "@mui/material";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";

import {
  stationUpdateFormSchema,
  type TStationUpdateFormValues,
} from "../model/schema";

const defaultValues: TStationUpdateFormValues = {
  stationName: "",
  managerEmail: "",
  chargerCount: 1,
};

export const StationUpdateFormExample = () => {
  const [submittedValues, setSubmittedValues] =
    useState<TStationUpdateFormValues | null>(null);
  const {
    control,
    handleSubmit,
    reset,
    formState: { isSubmitting },
  } = useForm<TStationUpdateFormValues>({
    defaultValues,
    mode: "onBlur",
    resolver: zodResolver(stationUpdateFormSchema),
  });

  const handleValidSubmit = (values: TStationUpdateFormValues) => {
    setSubmittedValues(values);
  };

  return (
    <Box
      component="form"
      noValidate
      onSubmit={handleSubmit(handleValidSubmit)}
      sx={{
        mx: "auto",
        maxWidth: 360,
        border: 1,
        borderColor: "divider",
        borderRadius: 2,
        bgcolor: "background.paper",
        p: 2,
      }}
    >
      <Stack spacing={1.5}>
        <Typography sx={{ fontSize: 14, fontWeight: 700 }}>
          충전소 정보 수정
        </Typography>

        <Controller
          control={control}
          name="stationName"
          render={({ field, fieldState }) => (
            <TextField
              {...field}
              error={!!fieldState.error}
              fullWidth
              helperText={fieldState.error?.message ?? " "}
              label="충전소명"
              size="small"
            />
          )}
        />

        <Controller
          control={control}
          name="managerEmail"
          render={({ field, fieldState }) => (
            <TextField
              {...field}
              error={!!fieldState.error}
              fullWidth
              helperText={fieldState.error?.message ?? " "}
              label="담당자 이메일"
              size="small"
              type="email"
            />
          )}
        />

        <Controller
          control={control}
          name="chargerCount"
          render={({ field, fieldState }) => (
            <TextField
              {...field}
              error={!!fieldState.error}
              fullWidth
              helperText={fieldState.error?.message ?? " "}
              label="충전기 수"
              onChange={(event) => field.onChange(Number(event.target.value))}
              size="small"
              type="number"
            />
          )}
        />

        <Stack direction="row" spacing={1}>
          <Button disabled={isSubmitting} type="submit" variant="contained">
            저장
          </Button>
          <Button
            disabled={isSubmitting}
            onClick={() => {
              reset(defaultValues);
              setSubmittedValues(null);
            }}
            type="button"
            variant="outlined"
          >
            초기화
          </Button>
        </Stack>

        {submittedValues && (
          <Typography sx={{ fontSize: 12, color: "text.secondary" }}>
            저장 요청: {submittedValues.stationName} /{" "}
            {submittedValues.managerEmail} / {submittedValues.chargerCount}대
          </Typography>
        )}
      </Stack>
    </Box>
  );
};
