import type {
  ChargingStationDetail,
  LocationPrices,
} from "@/entities/charging-station";
import { getChargerGroupRows } from "@/entities/charging-station";
import { cn } from "@/shared/lib/tailwind";

const GridStyleClass = {
  tr: "grid grid-cols-[30%_40%_30%]",
  th: "block py-2 text-sm font-semibold text-text-neutral-weak",
  td: "block py-2 text-sm font-semibold text-text-neutral-stronger",
};

interface Props {
  station: ChargingStationDetail;
  prices?: LocationPrices;
}

const getChargerFee = (label: string, prices?: LocationPrices) => {
  if (!prices) return;
  if (label.includes("초급속")) return prices.ultraFastFee;
  if (label.includes("완속")) return prices.slowFee;

  return prices.fastFee;
};

const formatFee = (fee?: string) => {
  if (!fee) return "-";

  return fee.endsWith("원") ? fee : `${fee}원`;
};

export const StationPriceTable = ({ station, prices }: Props) => {
  const rows = getChargerGroupRows(station);

  return (
    <div className="bg-surface-inverse-coolgray-stronger border-border-neutral-faint overflow-hidden rounded-2xl border">
      <table className="w-full border-collapse">
        <thead>
          <tr className={cn(GridStyleClass.tr, "px-5")}>
            <th className={cn(GridStyleClass.th, "text-left")}>속도</th>
            <th className={cn(GridStyleClass.th, "text-left")}>
              충전 가능 대수
            </th>
            <th className={cn(GridStyleClass.th, "text-right")}>회원가</th>
          </tr>
        </thead>
        <tbody className="bg-background-white block w-full rounded-2xl px-5 py-1.5">
          {rows.map((row, idx) => (
            <tr className={GridStyleClass.tr} key={row.key}>
              <td
                className={cn(GridStyleClass.td, "text-left", {
                  "border-border-neutral-weakest border-b":
                    idx !== rows.length - 1,
                })}
              >
                {row.label}
              </td>
              <td
                className={cn(GridStyleClass.td, "text-left", {
                  "border-border-neutral-weakest border-b":
                    idx !== rows.length - 1,
                })}
              >
                <p className="text-text-neutral-weak flex flex-1 items-center gap-1">
                  <span className="text-text-primary-stronger">
                    {row.available}
                  </span>
                  / {row.total}
                </p>
              </td>
              <td
                className={cn(GridStyleClass.td, "text-right", {
                  "border-border-neutral-weakest border-b":
                    idx !== rows.length - 1,
                })}
              >
                {formatFee(getChargerFee(row.label, prices))}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
