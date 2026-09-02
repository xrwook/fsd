import { TextField as HdsTextField } from "@hae-fe/elements";
import type { TextFieldProps as MuiTextFieldProps } from "@mui/material/TextField";
import type { ChangeEvent } from "react";

type HdsProps = Record<string, unknown>;
type TextFieldChangeEvent = ChangeEvent<HTMLInputElement | HTMLTextAreaElement>;

export interface TextFieldProps extends Omit<
  MuiTextFieldProps<"outlined">,
  "variant"
> {
  hdsProps?: HdsProps | boolean;
  numberOnly?: boolean;
  readOnly?: boolean;
  onClear?: () => void;
  timer?: string;
  withComma?: boolean;
}

const removeNonNumeric = (value: string) => value.replaceAll(/\D/g, "");

const formatWithComma = (value: string) =>
  value.replaceAll(/\B(?=(\d{3})+(?!\d))/g, ",");

const getNumberText = (value: unknown) => {
  if (value === null || value === undefined) {
    return value;
  }

  return removeNonNumeric(String(value));
};

const getDisplayValue = ({
  value,
  numberOnly,
  withComma,
}: {
  value: unknown;
  numberOnly: boolean;
  withComma: boolean;
}) => {
  if (!numberOnly && !withComma) {
    return value;
  }

  const numberText = getNumberText(value);
  if (typeof numberText !== "string") {
    return numberText;
  }

  return withComma ? formatWithComma(numberText) : numberText;
};

const getHdsProps = (
  hdsProps: TextFieldProps["hdsProps"],
): HdsProps | boolean => {
  if (hdsProps === false) {
    return false;
  }

  if (hdsProps === true || hdsProps === undefined) {
    return {
      helpText: "",
    };
  }

  return {
    helpText: "",
    ...hdsProps,
  };
};

export const TextField = ({
  defaultValue,
  hdsProps,
  numberOnly = false,
  onChange,
  type,
  value,
  withComma = false,
  ...props
}: TextFieldProps) => {
  const shouldUseNumberOnly = numberOnly || withComma;

  const handleChange = (event: TextFieldChangeEvent) => {
    if (!shouldUseNumberOnly) {
      onChange?.(event);
      return;
    }

    const nextValue = removeNonNumeric(event.target.value);

    event.target.value = nextValue;
    event.currentTarget.value = nextValue;
    onChange?.(event);
  };

  return (
    <HdsTextField
      {...props}
      defaultValue={getDisplayValue({
        value: defaultValue,
        numberOnly: shouldUseNumberOnly,
        withComma,
      })}
      hdsProps={getHdsProps(hdsProps)}
      type={withComma ? "text" : type}
      value={getDisplayValue({
        value,
        numberOnly: shouldUseNumberOnly,
        withComma,
      })}
      onChange={handleChange}
    />
  );
};
