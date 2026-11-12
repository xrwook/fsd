
import { IconCalendar, IconClock, IconClose } from '@hae-fe/icon-library/react';
import clsx from 'clsx';
import type { ChangeEventHandler, FocusEventHandler, KeyboardEventHandler, MouseEventHandler } from 'react';
import { forwardRef, useImperativeHandle, useRef } from 'react';

type DateTimeInputProps = {
  ariaLabel?: string;
  iconType?: 'calendar' | 'time';
  className?: string;
  disabled?: boolean;
  isOpen: boolean;
  onBlur?: FocusEventHandler<HTMLInputElement>;
  // onChange?: ChangeEventHandler<HTMLInputElement>;
  onClear: () => void;
  onClick?: MouseEventHandler<HTMLInputElement>;
  onFocus?: FocusEventHandler<HTMLInputElement>;
  onInputCommit?: (value: string) => void;
  onInputValueChange?: (value: string) => void;
  onKeyDown?: KeyboardEventHandler<HTMLInputElement>;
  placeholder?: string;
  value?: string;
  outsideClickIgnoreClass?: string;
  clearable: boolean;
};

export const DateTimeInput = forwardRef<HTMLInputElement, DateTimeInputProps>(
  (
    {
      ariaLabel = '날짜 시간',
      iconType = 'calendar',
      className,
      disabled,
      isOpen,
      onBlur,
      // onChange,
      onClear,
      onClick,
      onFocus,
      onKeyDown,
      onInputCommit,
      onInputValueChange,
      placeholder = 'YYYY-MM-DD HH:MM',
      value = '',
      outsideClickIgnoreClass,
      clearable,
    },
    ref,
  ) => {
    const inputRef = useRef<HTMLInputElement>(null);
    useImperativeHandle(ref, () => inputRef.current! as HTMLInputElement);

    const handleClear = () => {
      onClear();
    };

    const handleMouseDown: MouseEventHandler<HTMLDivElement> = event => {
      if (disabled) {
        event.preventDefault();
        return;
      }

      if (event.target instanceof Element && event.target.closest('.dateTimeClearButton')) {
        return;
      }

      inputRef.current?.focus({ preventScroll: true });
    };

    const handleClick: MouseEventHandler<HTMLDivElement> = event => {
      const isClearButton = event.target instanceof Element && event.target.closest('.dateTimeClearButton');
      if (disabled || event.target === inputRef.current || isClearButton) {
        return;
      }
      inputRef.current?.click();
    };

    const handleInputChange: ChangeEventHandler<HTMLInputElement> = event => {
      onInputValueChange?.(event.currentTarget.value);
    };

    const handleInputBlur: FocusEventHandler<HTMLInputElement> = event => {
      onInputCommit?.(event.currentTarget.value);
      onBlur?.(event);
    };

    const handleInputKeyDown: KeyboardEventHandler<HTMLInputElement> = event => {
      if (event.key === 'Enter') {
        event.preventDefault();
        event.currentTarget.blur();
        return;
      }

      onKeyDown?.(event);
    };

    return (
      <div
        role="button"
        aria-disabled={disabled}
        className={clsx(
          'dateTimeInput',
          {
            dateTimeInputActive: isOpen && !disabled,
            dateTimeInputDisabled: disabled,
          },
          className,
          outsideClickIgnoreClass,
        )}
        onClick={handleClick}
        onMouseDown={handleMouseDown}
        tabIndex={disabled ? -1 : 0}
        onKeyDown={event => {
          if (disabled || event.target !== event.currentTarget) return;
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            event.currentTarget.click();
          }
        }}
      >
        <input
          aria-label={ariaLabel}
          className={clsx('dateTimeInputField', outsideClickIgnoreClass)}
          disabled={disabled}
          onBlur={disabled ? undefined : handleInputBlur}
          onChange={disabled ? undefined : handleInputChange}
          onClick={disabled ? undefined : onClick}
          onFocus={disabled ? undefined : onFocus}
          onKeyDown={disabled ? undefined : handleInputKeyDown}
          placeholder={placeholder}
          ref={inputRef}
          value={value}
        />
        <div className="flex items-center justify-end">
          {value && !disabled && clearable ? (
            <button
              className={clsx('dateTimeClearButton', outsideClickIgnoreClass)}
              onClick={event => {
                event.stopPropagation();
                handleClear();
              }}
              onMouseDown={event => event.preventDefault()}
              type="button"
            >
              <IconClose size={16} type="outline" className={clsx('dateTimeCloseIcon', outsideClickIgnoreClass)} />
            </button>
          ) : null}
          {iconType === 'calendar' ? (
            <IconCalendar size={16} type="outline" className={clsx('dateTimeCalendarIcon', outsideClickIgnoreClass)} />
          ) : (
            <IconClock size={16} type="outline" className={clsx('dateTimeCalendarIcon', outsideClickIgnoreClass)} />
          )}
        </div>
      </div>
    );
  },
);


DateTimeInput.displayName = "DateTimeInput";
