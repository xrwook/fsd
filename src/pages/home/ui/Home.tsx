import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { useMainInfo } from "@/entities/user";
import { SCREEN_ID } from "@/shared/config";
import { logoutKeycloak } from "@/shared/lib/keycloak";
import PermissionGate from "@/shared/ui/permission-gate";
import { WelcomeWidget } from "@/widgets/welcome";

const stationPocSchema = z.object({
  stationName: z.string().trim().min(1, "충전소명을 입력해 주세요."),
});

type StationPocFormValues = z.infer<typeof stationPocSchema>;

const defaultStationPocValues: StationPocFormValues = {
  stationName: "",
};

const Home = () => {
  const [submittedValues, setSubmittedValues] =
    useState<StationPocFormValues | null>(null);

  const {
    formState: { errors, isSubmitting },
    handleSubmit,
    register,
    reset,
  } = useForm<StationPocFormValues>({
    defaultValues: defaultStationPocValues,
    mode: "onBlur",
    resolver: zodResolver(stationPocSchema),
  });

  const handleLogout = () => {
    logoutKeycloak().catch(() => {});
  };

  const handleStationPocSubmit = (values: StationPocFormValues) => {
    setSubmittedValues(values);
  };

  const { canAccessMenu } = useMainInfo();

  return (
    <div className="space-y-4">
      <WelcomeWidget />
      <section className="mx-auto max-w-[320px] rounded-2xl border border-gray-200 p-4">
        <div className="flex gap-2">
          <PermissionGate
            allow={canAccessMenu(
              SCREEN_ID.CPOS.STATION_MANAGEMENT,
              "canUpdate",
            )}
            fallback={
              <button
                type="button"
                className="rounded-md bg-gray-200 px-3 py-2 text-sm text-gray-500"
                disabled
              >
                충전소 수정 불가
              </button>
            }
          >
            <button
              type="button"
              className="rounded-md bg-blue-600 px-3 py-2 text-sm text-white"
              onClick={handleLogout}
            >
              충전소 수정
            </button>
          </PermissionGate>

          <PermissionGate
            allow={canAccessMenu(SCREEN_ID.DASHBOARD, "canDownload")}
            fallback={
              <button
                type="button"
                className="rounded-md bg-gray-200 px-3 py-2 text-sm text-gray-500"
                disabled
              >
                내보내기 불가
              </button>
            }
          >
            <button
              type="button"
              className="rounded-md bg-emerald-600 px-3 py-2 text-sm text-white"
            >
              내보내기
            </button>
          </PermissionGate>
        </div>
      </section>

      <section className="mx-auto max-w-[420px] rounded-2xl border border-gray-200 bg-white p-4">
        <form
          className="space-y-3"
          noValidate
          onSubmit={handleSubmit(handleStationPocSubmit)}
        >
          <div>
            <h2 className="text-sm font-bold text-gray-900">zodResolver POC</h2>
            <p className="mt-1 text-xs text-gray-500">
              react-hook-form submit 전에 Zod 스키마로 값을 검증합니다.
            </p>
          </div>

          <label className="block space-y-1">
            <span className="text-xs font-medium text-gray-700">충전소명</span>
            <input
              {...register("stationName")}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
              placeholder="예: 강남 충전소"
              type="text"
            />
            <span className="block min-h-4 text-xs text-red-500">
              {errors.stationName?.message}
            </span>
          </label>

          <div className="flex gap-2">
            <button
              className="rounded-md bg-blue-600 px-3 py-2 text-sm text-white disabled:bg-blue-300"
              disabled={isSubmitting}
              type="submit"
            >
              검증 후 저장
            </button>
            <button
              className="rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-700"
              disabled={isSubmitting}
              onClick={() => {
                reset(defaultStationPocValues);
                setSubmittedValues(null);
              }}
              type="button"
            >
              초기화
            </button>
          </div>

          {submittedValues && (
            <pre className="overflow-auto rounded-md bg-gray-950 p-3 text-xs text-gray-100">
              {JSON.stringify(submittedValues, null, 2)}
            </pre>
          )}
        </form>
      </section>
    </div>
  );
};

export default Home;
