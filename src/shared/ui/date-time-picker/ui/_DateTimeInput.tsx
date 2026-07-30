import clsx from "clsx";
import {
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
  onBlur?: FocusEventHandler<HTMLDivElement>;
  onClear: () => void;
  onClick?: MouseEventHandler<HTMLDivElement>;
  onFocus?: FocusEventHandler<HTMLDivElement>;
  onKeyDown?: KeyboardEventHandler<HTMLDivElement>;
  placeholder?: string;
  value: string;
};

/** react-datepicker의 customInput으로 쓰이는 날짜/시간 입력 영역이다. */
export const DateTimeInput = forwardRef<HTMLDivElement, DateTimeInputProps>(
  (
    {
      className,
      disabled,
      isOpen,
      onBlur,
      onClear,
      onClick,
      onFocus,
      onKeyDown,
      placeholder = "YYYY-MM-DD HH:MM",
      value,
    },
    ref,
  ) => (
    <div
      aria-label="날짜 시간"
      aria-disabled={disabled}
      className={clsx(
        "dateTimeInput",
        {
          dateTimeInputActive: isOpen && !disabled,
          dateTimeInputDisabled: disabled,
        },
        className,
      )}
      onBlur={disabled ? undefined : onBlur}
      onClick={disabled ? undefined : onClick}
      onFocus={disabled ? undefined : onFocus}
      onKeyDown={disabled ? undefined : onKeyDown}
      onMouseDown={disabled ? (event) => event.preventDefault() : undefined}
      ref={ref}
      role="button"
      tabIndex={disabled ? -1 : 0}
    >
      <span
        className={clsx("dateTimeInputValue", {
          dateTimeInputPlaceholder: !value,
        })}
      >
        {value || placeholder}
      </span>

      {value && !disabled ? (
        <button
          aria-label="날짜 시간 초기화"
          className="dateTimeClearButton"
          onClick={(event) => {
            event.stopPropagation();
            onClear();
          }}
          onMouseDown={(event) => event.preventDefault()}
          type="button"
        >
          <DateTimeCloseIcon aria-hidden="true" className="dateTimeCloseIcon" />
        </button>
      ) : null}

      <DateTimeCalendarIcon
        aria-hidden="true"
        className="dateTimeCalendarIcon"
      />
    </div>
  ),
);

DateTimeInput.displayName = "DateTimeInput";
