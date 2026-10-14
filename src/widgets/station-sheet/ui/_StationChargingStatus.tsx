import { DateTime } from "luxon";
import { Fragment, useState } from "react";

import {
  type ChargingStationDetail,
  type EvseResponse,
  getPrice,
  isSelfBrandCpo,
  MEMBER_TYPE,
} from "@/entities/charging-station";
import { Expand16Icon, Help12Icon, Refresh16Icon } from "@/shared/assets/icons";
import { toRelativeTimeText } from "@/shared/lib/time";
import { AppTextButton } from "@/shared/ui/button";
import { AppChargerCard } from "@/shared/ui/card";
import { Divider } from "@/shared/ui/divider";
import { Tooltip } from "@/shared/ui/tooltip";

import { CHARGER_CARD_STATE_BY_EVSE_STATUS } from "../config/charger";

const INITIAL_VISIBLE_CHARGER_COUNT = 3;

const ChargerPriceRow = ({
  label,
  price,
}: {
  label: number | string;
  price: number | string;
}) => (
  <div className="mt-6 mb-4 flex items-center justify-between gap-1">
    <div className="flex items-center gap-1.5 px-2">
      <span className="text-text-neutral-stronger text-[15px] font-semibold">
        {label}kW
      </span>
      <Divider orientation="vertical" />
      {/* TODO: 요금 API 미연동. 실제 가격 확정 전까지 하드코딩 유지 */}
      <span className="text-text-neutral-stronger text-[15px] font-semibold">
        {price}원
      </span>
    </div>
  </div>
);

interface Props {
  station: ChargingStationDetail;
  onRefresh: () => Promise<boolean>;
}

const getVisibleEvseResponses = (
  row: EvseResponse[],
  count: number,
) => {
  let remainingChargerCount = count;

  return row.flatMap((response) => {
    if (remainingChargerCount <= 0) return [];

    const evses = response.evses.slice(0, remainingChargerCount);
    remainingChargerCount -= evses.length;

    return evses.length > 0 ? [{ ...response, evses }] : [];
  });
};

export const StationChargingStatus = ({ station, onRefresh }: Props) => {
  const [isRefresh, setIsRefresh] = useState(false);
  const [refreshedAt, setRefreshedAt] = useState(() => DateTime.now());
  const [expandedLocationId, setExpandedLocationId] = useState<string | null>(
    null,
  );
  const evses = station.evseResponses;
  const isSelfBrand = isSelfBrandCpo(station.cpoId);
  const isExpanded = expandedLocationId === station.locationId;
  const totalChargerCount = evses.reduce(
    (total, response) => total + response.evses.length,
    0,
  );
  const visibleChargerCount = isExpanded
    ? totalChargerCount
    : INITIAL_VISIBLE_CHARGER_COUNT;
  const visibleEvses = getVisibleEvseResponses(evses, visibleChargerCount);
  const hiddenChargerCount = Math.max(
    totalChargerCount - INITIAL_VISIBLE_CHARGER_COUNT,
    0,
  );

  const handleRefresh = async () => {
    if (isRefresh) return;
    setIsRefresh(true);

    try {
      const isSuccess = await onRefresh();
      if (isSuccess) setRefreshedAt(DateTime.now());
    } finally {
      setIsRefresh(false);
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
          iconRight={<Refresh16Icon onClick={handleRefresh} />}
          size="small"
        >
          오늘 {refreshedAt.toFormat("HH:mm")} 기준
        </AppTextButton>
      </div>

      {visibleEvses.map((item, idx) => {
        const feeType = isSelfBrand ? MEMBER_TYPE.MEMBER : MEMBER_TYPE.ROAMING;

        return (
          <Fragment key={idx}>
            <ChargerPriceRow
              label={item.availCpkW}
              price={getPrice(item.availCpkW, feeType)}
            />
            <div className="flex flex-col gap-2">
              {item.evses.map((evse, idx) => {
                const state = CHARGER_CARD_STATE_BY_EVSE_STATUS[evse.status];

                return state === "unconfirmed" ? (
                  <AppChargerCard
                    key={`${evse.cpId}_${idx}`}
                    state="unconfirmed"
                  />
                ) : (
                  <AppChargerCard
                    key={`${evse.cpId}_${idx}`}
                    state={state}
                    time={toRelativeTimeText(evse.chargeEndDate)}
                  />
                );
              })}
            </div>
          </Fragment>
        );
      })}

      {!isExpanded && hiddenChargerCount > 0 && (
        <div className="mt-6 flex justify-center">
          <button
            className="border-border-neutral-faint text-text-neutral-stronger flex h-12 items-center gap-0.5 rounded-full border px-5 text-[15px] font-semibold"
            type="button"
            onClick={() => setExpandedLocationId(station.locationId)}
          >
            {hiddenChargerCount}개 더보기 <Expand16Icon />
          </button>
        </div>
      )}
    </>
  );
};
