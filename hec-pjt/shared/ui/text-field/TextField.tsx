import { IconButton, TextField as HdsTextField } from "@hae-fe/elements";
import { IconClose } from "@hae-fe/icon-library/react";
import type { TextFieldProps as MuiTextFieldProps } from "@mui/material/TextField";
import { useForkRef } from "@mui/material/utils";
import type { ChangeEvent, MouseEvent, ReactNode } from "react";
import { useRef, useState } from "react";

type HdsProps = Record<string, unknown> & {
  helpText?: string;
  clearable?: boolean;
  endAdornment?: ReactNode;
};
type TextFieldChangeEvent = ChangeEvent<HTMLInputElement | HTMLTextAreaElement>;

export interface TextFieldProps extends Omit<
  MuiTextFieldProps<"outlined">,
  "variant"
> {
  after?: ReactNode;
  before?: ReactNode;
  clearable?: boolean;
  hdsProps?: HdsProps | boolean;
  maxLength?: number;
  numberOnly?: boolean;
  readOnly?: boolean;
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
): HdsProps | false => {
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
  after,
  before,
  clearable = true,
  defaultValue,
  hdsProps,
  inputRef,
  maxLength,
  numberOnly = false,
  onChange,
  type,
  value,
  withComma = false,
  ...props
}: TextFieldProps) => {
  const inputElementRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null);
  const mergedInputRef = useForkRef(inputElementRef, inputRef);
  const [uncontrolledValue, setUncontrolledValue] = useState(defaultValue ?? "");
  const currentValue = value === undefined ? uncontrolledValue : value;
  const shouldUseNumberOnly = numberOnly || withComma;
  const isEndAdornment =
    clearable &&
    currentValue !== null &&
    String(currentValue).length > 0 &&
    !props.disabled &&
    !props.readOnly;

  const handleMouseDown = (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
  };

  const handleClear = () => {
    const input = inputElementRef.current;
    if (!input || !clearable || props.disabled || props.readOnly) {
      return;
    }

    const prototype =
      input instanceof HTMLTextAreaElement
        ? HTMLTextAreaElement.prototype
        : HTMLInputElement.prototype;

    // Use the native setter so React detects the change and calls onChange.
    Object.getOwnPropertyDescriptor(prototype, "value")?.set?.call(input, "");
    input.dispatchEvent(new Event("input", { bubbles: true }));
    setUncontrolledValue("");
  };

  const handleChange = (event: TextFieldChangeEvent) => {
    if (!shouldUseNumberOnly && maxLength === undefined) {
      setUncontrolledValue(event.target.value);
      onChange?.(event);
      return;
    }

    const nextValue = shouldUseNumberOnly
      ? removeNonNumeric(event.target.value)
      : event.target.value;
    const limitedValue =
      maxLength === undefined ? nextValue : nextValue.slice(0, maxLength);

    event.target.value = limitedValue;
    event.currentTarget.value = limitedValue;
    setUncontrolledValue(limitedValue);
    onChange?.(event);
  };

  return (
    <>
      {before}
      <HdsTextField
        {...props}
        inputRef={mergedInputRef}
        defaultValue={getDisplayValue({
          value: defaultValue,
          numberOnly: shouldUseNumberOnly,
          withComma,
        })}
        hdsProps={
          hdsProps === false
            ? false
            : {
                endAdornment: isEndAdornment ? (
                  <IconButton
                    type="button"
                    size="large"
                    onMouseDown={handleMouseDown}
                    onClick={handleClear}
                    semantic="ghost"
                    className="mt-1.5"
                    aria-label="입력 내용 지우기"
                  >
                    <IconClose size={16} className="iconGray" />
                  </IconButton>
                ) : null,
                ...getHdsProps(hdsProps),
                clearable: false,
              }
        }
        type={withComma ? "text" : type}
        value={getDisplayValue({
          value,
          numberOnly: shouldUseNumberOnly,
          withComma,
        })}
        onChange={handleChange}
      />
      {after}
    </>
  );
};
