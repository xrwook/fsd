import clsx from "clsx";
import {
  type FocusEventHandler,
  forwardRef,
  type KeyboardEventHandler,
  type MouseEventHandler,
} from "react";

import { CalendarIcon, CloseIcon } from "./_DateRangeIcons";

type DateRangeInputProps = {
  className?: string;
  disabled?: boolean;
  endValue: string;
  isOpen: boolean;
  onBlur?: FocusEventHandler<HTMLDivElement>;
  onClear: () => void;
  onClick?: MouseEventHandler<HTMLDivElement>;
  onFocus?: FocusEventHandler<HTMLDivElement>;
  onKeyDown?: KeyboardEventHandler<HTMLDivElement>;
  startValue: string;
};

export const DateRangeInput = forwardRef<HTMLDivElement, DateRangeInputProps>(
  (
    {
      className,
      disabled,
      endValue,
      isOpen,
      onBlur,
      onClear,
      onClick,
      onFocus,
      onKeyDown,
      startValue,
    },
    ref,
  ) => {
    let activeSegment: "end" | "start" | null = null;

    if (isOpen) {
      activeSegment = startValue && !endValue ? "end" : "start";
    }

    return (
      <div
        aria-label="조회 기간"
        className={clsx("dateRangeInput", className)}
        onBlur={onBlur}
        onClick={disabled ? undefined : onClick}
        onFocus={onFocus}
        onKeyDown={onKeyDown}
        ref={ref}
        role="group"
        tabIndex={disabled ? -1 : 0}
      >
        <div
          className={clsx("dateRangeInputSegment", {
            dateRangeInputSegmentActive: activeSegment === "start",
          })}
        >
          <span
            className={clsx("dateRangeInputValue", {
              dateRangeInputPlaceholder: !startValue,
            })}
          >
            {startValue || "YYYY-MM-DD"}
          </span>

          {startValue || endValue ? (
            <button
              aria-label="조회 기간 초기화"
              className="dateRangeClearButton"
              onClick={(event) => {
                event.stopPropagation();
                onClear();
              }}
              onMouseDown={(event) => event.preventDefault()}
              type="button"
            >
              <CloseIcon />
            </button>
          ) : null}

          <CalendarIcon />
        </div>

        <span aria-hidden="true" className="dateRangeSeparator">
          –
        </span>

        <div
          className={clsx("dateRangeInputSegment", {
            dateRangeInputSegmentActive: activeSegment === "end",
          })}
        >
          <span
            className={clsx("dateRangeInputValue", {
              dateRangeInputPlaceholder: !endValue,
            })}
          >
            {endValue || "YYYY-MM-DD"}
          </span>
          <CalendarIcon />
        </div>
      </div>
    );
  },
);

DateRangeInput.displayName = "DateRangeInput";
