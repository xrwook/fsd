// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { DateRangePicker } from "./DateRangePicker";

const ONE_WEEK_QUICK_RANGE = [
  {
    amount: 7,
    label: "1주",
    unit: "days" as const,
  },
];

afterEach(() => {
  cleanup();
  vi.useRealTimers();
});

describe("DateRangePicker filter quick actions", () => {
  it("설정된 기간과 관계없이 오늘이 포함된 월을 먼저 표시한다", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 9, 14));

    render(
      <DateRangePicker
        endDate="2026-02-20"
        inputVariant="filter"
        onChange={vi.fn()}
        startDate="2026-02-10"
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "조회 기간" }));

    expect(
      document.querySelector(".react-datepicker__current-month")?.textContent,
    ).toBe("2026 Oct");
  });

  it("기본적으로 달력 팝오버를 컴포넌트 내부에 렌더링한다", () => {
    const { container } = render(
      <DateRangePicker endDate="" onChange={vi.fn()} startDate="" />,
    );

    fireEvent.click(screen.getByRole("group", { name: "조회 기간" }));

    expect(container.querySelector(".dateRangeCalendar")).not.toBeNull();
  });

  it("usePortal이면 달력 팝오버를 document body의 portal에 렌더링한다", () => {
    const { container } = render(
      <DateRangePicker endDate="" onChange={vi.fn()} startDate="" usePortal />,
    );

    fireEvent.click(screen.getByRole("group", { name: "조회 기간" }));

    expect(container.querySelector(".dateRangeCalendar")).toBeNull();
    expect(
      document.querySelector("#date-range-picker-portal .dateRangeCalendar"),
    ).not.toBeNull();
  });

  it("시작일만 있으면 시작일 기준으로 빠른 기간을 계산한다", () => {
    const onChange = vi.fn();
    render(
      <DateRangePicker
        endDate=""
        inputVariant="filter"
        onChange={onChange}
        quickRanges={ONE_WEEK_QUICK_RANGE}
        startDate="2026-09-18"
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "조회 기간" }));
    fireEvent.click(screen.getByRole("button", { name: "1주" }));

    expect(onChange).toHaveBeenCalledWith("2026-09-11", "2026-09-18");
  });

  it("시작일과 종료일이 모두 있으면 오늘 기준으로 빠른 기간을 계산한다", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 9, 14));
    const onChange = vi.fn();
    render(
      <DateRangePicker
        endDate="2026-09-25"
        inputVariant="filter"
        onChange={onChange}
        quickRanges={ONE_WEEK_QUICK_RANGE}
        startDate="2026-09-18"
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "조회 기간" }));
    fireEvent.click(screen.getByRole("button", { name: "1주" }));

    expect(onChange).toHaveBeenCalledWith("2026-10-07", "2026-10-14");
  });
});
