import { DateTime } from "luxon";
import { useState } from "react";

import type { ChargingStationDetail } from "@/entities/charging-station";
import { getChargerGroupRowsWithEvses } from "@/entities/charging-station";
import { Expand16Icon, Help12Icon, Refresh16Icon } from "@/shared/assets/icons";
import { AppTextButton } from "@/shared/ui/button";
import { AppChargerCard } from "@/shared/ui/card";
import { Divider } from "@/shared/ui/divider";
import { Tooltip } from "@/shared/ui/tooltip";

import { CHARGER_CARD_STATE_BY_EVSE_STATUS } from "../config/charger";

const ChargerPriceRow = ({ label }: { label: string }) => (
  <div className="mt-6 mb-4 flex items-center justify-between gap-1">
    <div className="flex items-center gap-1.5 px-2">
      <span className="text-text-neutral-stronger text-[15px] font-semibold">
        {label}
      </span>
      <Divider orientation="vertical" />
      {/* TODO: 요금 API 미연동. 실제 가격 확정 전까지 하드코딩 유지 */}
      <span className="text-text-neutral-stronger text-[15px] font-semibold">
        280원
      </span>
    </div>
  </div>
);

interface Props {
  station: ChargingStationDetail;
  onRefresh: () => Promise<boolean>;
}

const toRelativeTimeText = (value: string) => {
  const dateTime = DateTime.fromISO(value).setLocale("ko");

  return dateTime.isValid ? (dateTime.toRelative() ?? "") : "";
};

export const StationChargingStatus = ({ station, onRefresh }: Props) => {
  const [refreshedAt, setRefreshedAt] = useState(() => DateTime.now());
  const [isRefreshing, setIsRefreshing] = useState(false);
  const chargerGroupRows = getChargerGroupRowsWithEvses(station);
  const evseCount = chargerGroupRows.reduce(
    (total, row) =>
      total +
      row.evseResponses.reduce(
        (rowTotal, response) => rowTotal + response.evses.length,
        0,
      ),
    0,
  );
  const currentTimeText = refreshedAt.toFormat("HH:mm");

  const handleRefresh = async () => {
    if (isRefreshing) return;

    setIsRefreshing(true);

    try {
      const isSuccess = await onRefresh();
      if (isSuccess) setRefreshedAt(DateTime.now());
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <>
      <div className="flex justify-between px-2">
        <div className="flex items-center gap-1">
          <p className="text-text-neutral-stronger text-base font-semibold">
            실시간 충전 현황
          </p>
          <Tooltip
            content="실제 충전 속도는 차량 및 환경에 따라 달라질 수 있어요."
            placement="top"
          >
            <Help12Icon className="text-icon-neutral-weaker" />
          </Tooltip>
        </div>
        <AppTextButton
          color="gray"
          iconRight={<Refresh16Icon />}
          size="small"
          onClick={handleRefresh}
        >
          오늘 {currentTimeText} 기준
        </AppTextButton>
      </div>

      {chargerGroupRows.map((row) => (
        <div key={row.key}>
          <ChargerPriceRow label={row.label} />

          {row.evseResponses.map((response) => (
            <div
              className="flex flex-col gap-2"
              key={`${row.key}-${response.availCpKw}`}
            >
              {response.evses.map((evse) => {
                const state = CHARGER_CARD_STATE_BY_EVSE_STATUS[evse.status];

                return state === "unconfirmed" ? (
                  <AppChargerCard key={evse.cpId} state="unconfirmed" />
                ) : (
                  <AppChargerCard
                    key={evse.cpId}
                    state={state}
                    time={
                      evse.chargeEndDate
                        ? toRelativeTimeText(evse.chargeEndDate)
                        : undefined
                    }
                  />
                );
              })}
            </div>
          ))}
        </div>
      ))}

      <div className="mt-6 flex justify-center">
        <button
          className="border-border-neutral-faint text-text-neutral-stronger flex h-12 items-center gap-0.5 rounded-full border px-5 text-[15px] font-semibold"
          type="button"
        >
          {evseCount}개 더보기 <Expand16Icon />
        </button>
      </div>
    </>
  );
};
