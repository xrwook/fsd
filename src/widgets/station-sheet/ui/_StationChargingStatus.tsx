import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import RefreshIcon from "@mui/icons-material/Refresh";

import type { ChargingStationDetail, Evse } from "@/entities/charging-station";
import {
  getChargerGroupRows,
  getStationEvses,
} from "@/entities/charging-station";

interface Props {
  station: ChargingStationDetail;
}

const getStatusLabel = (status: string) => {
  if (status === "AVAILABLE") return "사용 가능";
  if (status === "CHARGING") return "충전 중";
  if (status === "OUT_OF_SERVICE") return "점검 중";
  return "확인 불가";
};

const getStatusClassName = (status: string) => {
  if (status === "AVAILABLE") return "text-green-700 bg-green-50";
  if (status === "CHARGING") return "text-blue-700 bg-blue-50";
  return "text-text-neutral-weaker bg-background-coolgray-weakest";
};

const ChargerCard = ({ evse }: { evse: Evse }) => {
  const statusLabel = getStatusLabel(evse.status);
  const statusClassName = getStatusClassName(evse.status);

  return (
    <article className="border-border-neutral-weakest bg-background-white rounded-2xl border p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-text-neutral-stronger text-sm font-semibold">
            {evse.cpName}
          </p>
          <p className="text-text-neutral-weaker mt-1 text-xs">
            {evse.chargerType} · {evse.availCpkW}kW
          </p>
        </div>
        <span
          className={`rounded-full px-2.5 py-1 text-xs font-semibold ${statusClassName}`}
        >
          {statusLabel}
        </span>
      </div>
      {evse.chargeEndDate && evse.status === "CHARGING" && (
        <p className="text-text-neutral-weaker mt-3 text-xs">
          충전 종료 예정 {new Date(evse.chargeEndDate).toLocaleString("ko-KR")}
        </p>
      )}
    </article>
  );
};

const StationChargingStatus = ({ station }: Props) => {
  const priceRowLabels = getChargerGroupRows(station).map((row) => row.label);
  const evses = getStationEvses(station);

  return (
    <section className="bg-background-white flex flex-col px-4 pt-8 pb-10">
      <div className="flex items-center justify-between px-2">
        <div className="flex items-center gap-1">
          <h3 className="text-text-neutral-stronger text-base font-semibold">
            실시간 충전 현황
          </h3>
          <span
            aria-label="실시간 충전 현황 안내"
            className="border-border-neutral-weakest text-text-neutral-weaker flex size-4 items-center justify-center rounded-full border text-[10px] font-semibold"
            role="img"
          >
            ?
          </span>
        </div>
        <button
          className="text-text-neutral-weaker flex items-center gap-1 text-xs"
          type="button"
        >
          오늘{" "}
          {new Date().toLocaleTimeString("ko-KR", {
            hour: "2-digit",
            minute: "2-digit",
          })}{" "}
          기준
          <RefreshIcon fontSize="small" />
        </button>
      </div>

      <div className="mt-5 flex flex-wrap gap-3 px-2">
        {priceRowLabels.map((label) => (
          <div className="flex items-center gap-2" key={label}>
            <span className="text-text-neutral-stronger text-[15px] font-semibold">
              {label}
            </span>
            <span className="bg-border-neutral-weakest h-4 w-px" />
            <span className="text-text-neutral-stronger text-[15px] font-semibold">
              280원
            </span>
          </div>
        ))}
      </div>

      <div className="mt-5 flex flex-col gap-2">
        {evses.map((evse) => (
          <ChargerCard evse={evse} key={evse.cpId} />
        ))}
      </div>

      <div className="mt-6 flex justify-center">
        <button
          className="border-border-neutral-faint text-text-neutral-stronger flex h-12 items-center gap-1 rounded-full border px-5 text-[15px] font-semibold"
          type="button"
        >
          {evses.length}개 더보기 <ExpandMoreIcon fontSize="small" />
        </button>
      </div>
    </section>
  );
};

export default StationChargingStatus;
