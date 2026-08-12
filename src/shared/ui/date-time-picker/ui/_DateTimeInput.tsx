import clsx from "clsx";
import {
  type ChangeEvent,
  type ChangeEventHandler,
  type FocusEventHandler,
  forwardRef,
  type KeyboardEventHandler,
  type MouseEventHandler,
} from "react";

import DateTimeCalendarIcon from "../assets/icons/calendar.svg?react";
import DateTimeCloseIcon from "../assets/icons/close.svg?react";

type DateTimeInputProps = {
  className?: string;
  disabled?: boolean;
  isOpen: boolean;
  onBlur?: FocusEventHandler<HTMLInputElement>;
  onChange?: ChangeEventHandler<HTMLInputElement>;
  onClear: () => void;
  onClick?: MouseEventHandler<HTMLInputElement>;
  onFocus?: FocusEventHandler<HTMLInputElement>;
  onKeyDown?: KeyboardEventHandler<HTMLInputElement>;
  placeholder?: string;
  value?: string;
};

/** react-datepicker의 customInput으로 쓰이는 날짜/시간 입력 영역이다. */
export const DateTimeInput = forwardRef<HTMLInputElement, DateTimeInputProps>(
  (
    {
      className,
      disabled,
      isOpen,
      onBlur,
      onChange,
      onClear,
      onClick,
      onFocus,
      onKeyDown,
      placeholder = "YYYY-MM-DD HH:MM",
      value = "",
    },
    ref,
  ) => {
    const handleClear = () => {
      if (onChange) {
        onChange({
          currentTarget: { value: "" },
          target: { value: "" },
        } as ChangeEvent<HTMLInputElement>);
        return;
      }

      onClear();
    };

    return (
      <div
        aria-disabled={disabled}
        className={clsx(
          "dateTimeInput",
          {
            dateTimeInputActive: isOpen && !disabled,
            dateTimeInputDisabled: disabled,
          },
          className,
        )}
        onMouseDown={disabled ? (event) => event.preventDefault() : undefined}
      >
        <input
          aria-label="날짜 시간"
          className="dateTimeInputField"
          disabled={disabled}
          onBlur={disabled ? undefined : onBlur}
          onChange={disabled ? undefined : onChange}
          onClick={disabled ? undefined : onClick}
          onFocus={disabled ? undefined : onFocus}
          onKeyDown={disabled ? undefined : onKeyDown}
          placeholder={placeholder}
          ref={ref}
          value={value}
        />

        {value && !disabled ? (
          <button
            aria-label="날짜 시간 초기화"
            className="dateTimeClearButton"
            onClick={(event) => {
              event.stopPropagation();
              handleClear();
            }}
            onMouseDown={(event) => event.preventDefault()}
            type="button"
          >
            <DateTimeCloseIcon
              aria-hidden="true"
              className="dateTimeCloseIcon"
            />
          </button>
        ) : null}

        <DateTimeCalendarIcon
          aria-hidden="true"
          className="dateTimeCalendarIcon"
        />
      </div>
    );
  },
);

DateTimeInput.displayName = "DateTimeInput";
