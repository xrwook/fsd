import "react-datepicker/dist/react-datepicker.css";
import "../assets/date-range-picker.css";

import { useRef, useState } from "react";
import ReactDatePicker from "react-datepicker";

import { QUICK_RANGES, type QuickRange } from "../config/quickRanges";
import { formatDate, parseDate, startOfToday } from "../lib/date";
import { DateRangeInput } from "./_DateRangeInput";
import { DateRangeQuickActions } from "./_DateRangeQuickActions";

type DateRangePickerProps = {
  endDate: string;
  onChange: (startDate: string, endDate: string) => void;
  startDate: string;
};

export const DateRangePicker = ({
  endDate,
  onChange,
  startDate,
}: DateRangePickerProps) => {
  const pickerRef = useRef<ReactDatePicker>(null);
  const [isOpen, setIsOpen] = useState(false);
  const selectedStartDate = parseDate(startDate);
  const selectedEndDate = parseDate(endDate);

  const handleQuickRange = (quickRange: QuickRange) => {
    const nextEndDate = startOfToday();
    const nextStartDate = quickRange.startDate(nextEndDate);

    onChange(formatDate(nextStartDate), formatDate(nextEndDate));
    pickerRef.current?.setOpen(false);
  };

  return (
    <div className="dateRangePicker">
      <ReactDatePicker
        calendarClassName="dateRangeCalendar"
        customInput={
          <DateRangeInput
            endValue={endDate}
            isOpen={isOpen}
            onClear={() => onChange("", "")}
            startValue={startDate}
          />
        }
        dateFormat="yyyy-MM-dd"
        dateFormatCalendar="yyyy MMM"
        endDate={selectedEndDate}
        monthsShown={2}
        onCalendarClose={() => setIsOpen(false)}
        onCalendarOpen={() => setIsOpen(true)}
        onChange={([nextStartDate, nextEndDate]) =>
          onChange(formatDate(nextStartDate), formatDate(nextEndDate))
        }
        popperClassName="dateRangePopper"
        popperPlacement="bottom-start"
        ref={pickerRef}
        selectsRange
        selected={selectedStartDate}
        showPopperArrow={false}
        startDate={selectedStartDate}
      >
        <DateRangeQuickActions
          onSelect={handleQuickRange}
          quickRanges={QUICK_RANGES}
        />
      </ReactDatePicker>
    </div>
  );
};
