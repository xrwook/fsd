import { useState } from "react";

import {
  DateRangePicker,
  type DateRangeQuickRange,
} from "@/shared/ui/date-range-picker";
import { TiptapEditor, TiptapViewer } from "@/shared/ui/editor";
import { DateTimePicker } from "@/shared/ui/date-time-picker";

const USE_PERIOD_QUICK_RANGES: DateRangeQuickRange[] = [
  {
    amount: 7,
    label: "1주",
    unit: "days",
  },
  {
    amount: 1,
    label: "1개월",
    unit: "months",
  },
  {
    amount: 3,
    label: "3개월",
    unit: "months",
  },
  {
    amount: 6,
    label: "6개월",
    unit: "months",
  },
  {
    amount: 12,
    label: "1년",
    unit: "months",
  },
];

const CorporateJoin = () => {
  const [content, setContent] = useState("");
  const [usePeriod, setUsePeriod] = useState({
    endDate: "",
    startDate: "",
  });
  const [isUploading, setIsUploading] = useState(false);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-gray-900">기업 회원 가입</h1>
        <p className="mt-1 text-sm text-gray-500">
          기업 소개 내용을 작성해 주세요.
        </p>
      </div>

      <section className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
        <DateTimePicker 
          value={new Date()}
          // mode="time"
          onChange={(value) => console.log(value)}
          dateFormat="yyyy-MM"
          minDate={new Date("2026-08-20 15:00")}
          showMonthYearPicker
        />
      </section>

      <section className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-semibold text-gray-900">기업 소개 에디터</h2>
          {isUploading && (
            <span className="text-xs text-blue-600">이미지 업로드 중</span>
          )}
        </div>

        <TiptapEditor
          value={content}
          placeholder="기업 소개 내용을 입력하세요."
          onChange={setContent}
          onUploadStateChange={setIsUploading}
        />
      </section>

      <section className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
        <h2 className="mb-3 font-semibold text-gray-900">HTML 결과</h2>
        <pre className="max-h-72 overflow-auto whitespace-pre-wrap break-all rounded-md bg-gray-50 p-4 text-xs text-gray-700">
          {content || "(작성된 내용이 없습니다.)"}
        </pre>
      </section>

      <section className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
        <h2 className="mb-3 font-semibold text-gray-900">미리보기</h2>
        <div className="max-h-[520px] overflow-auto rounded-md bg-gray-50 p-4">
          <TiptapViewer value={content} />
        </div>
      </section>

      <section className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
        <h2 className="mb-3 font-semibold text-gray-900">
          사용 기한 Date Picker
        </h2>
        <div className="overflow-auto rounded-md bg-gray-50 p-4">
          <div className="flex items-center gap-4">
            <label className="w-32 shrink-0 text-right text-sm font-medium text-gray-900">
              사용 기한:<span className="text-red-600">*</span>
            </label>
            <DateRangePicker
              endDate={usePeriod.endDate}
              onChange={(startDate, endDate) =>
                setUsePeriod({
                  endDate,
                  startDate,
                })
              }
              quickRangeDirection="future"
              quickRanges={USE_PERIOD_QUICK_RANGES}
              startDate={usePeriod.startDate}
            />
          </div>
        </div>
      </section>
    </div>
  );
};

export default CorporateJoin;
