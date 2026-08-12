import clsx from "clsx";
import {
  type ChangeEvent,
  type ChangeEventHandler,
  type FocusEventHandler,
  forwardRef,
  type KeyboardEventHandler,
  type MouseEventHandler,
  useImperativeHandle,
  useRef,
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
  onInputCommit?: (value: string) => void;
  onKeyDown?: KeyboardEventHandler<HTMLInputElement>;
  placeholder?: string;
  outsideClickIgnoreClassName?: string;
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
      onInputCommit,
      onKeyDown,
      outsideClickIgnoreClassName,
      placeholder = "YYYY-MM-DD HH:MM",
      value = "",
    },
    ref,
  ) => {
    const inputRef = useRef<HTMLInputElement>(null);

    useImperativeHandle(ref, () => inputRef.current as HTMLInputElement);

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

    const handleMouseDown: MouseEventHandler<HTMLDivElement> = (event) => {
      if (disabled) {
        event.preventDefault();
        return;
      }

      if (
        event.target instanceof HTMLElement &&
        event.target.closest(".dateTimeClearButton")
      ) {
        return;
      }

      inputRef.current?.focus({ preventScroll: true });
    };

    const handleClick: MouseEventHandler<HTMLDivElement> = (event) => {
      if (disabled || event.target === inputRef.current) return;

      inputRef.current?.click();
    };

    const handleInputBlur: FocusEventHandler<HTMLInputElement> = (event) => {
      onInputCommit?.(event.currentTarget.value);
      onBlur?.(event);
    };

    const handleInputKeyDown: KeyboardEventHandler<HTMLInputElement> = (
      event,
    ) => {
      if (event.key === "Enter") {
        event.preventDefault();
        onInputCommit?.(event.currentTarget.value);
        event.currentTarget.blur();
        return;
      }

      onKeyDown?.(event);
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
          outsideClickIgnoreClassName,
        )}
        onClick={handleClick}
        onMouseDown={handleMouseDown}
      >
        <input
          aria-label="날짜 시간"
          className={clsx("dateTimeInputField", outsideClickIgnoreClassName)}
          disabled={disabled}
          onBlur={disabled ? undefined : handleInputBlur}
          onChange={disabled ? undefined : onChange}
          onClick={disabled ? undefined : onClick}
          onFocus={disabled ? undefined : onFocus}
          onKeyDown={disabled ? undefined : handleInputKeyDown}
          placeholder={placeholder}
          ref={inputRef}
          value={value}
        />

        {value && !disabled ? (
          <button
            aria-label="날짜 시간 초기화"
            className={clsx("dateTimeClearButton", outsideClickIgnoreClassName)}
            onClick={(event) => {
              event.stopPropagation();
              handleClear();
            }}
            onMouseDown={(event) => event.preventDefault()}
            type="button"
          >
            <DateTimeCloseIcon
              aria-hidden="true"
              className={clsx("dateTimeCloseIcon", outsideClickIgnoreClassName)}
            />
          </button>
        ) : null}

        <DateTimeCalendarIcon
          aria-hidden="true"
          className={clsx("dateTimeCalendarIcon", outsideClickIgnoreClassName)}
        />
      </div>
    );
  },
);

DateTimeInput.displayName = "DateTimeInput";
