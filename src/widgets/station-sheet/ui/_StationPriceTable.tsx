import type { ChargingStationDetail } from "@/entities/charging-station";
import { getChargerGroupRows } from "@/entities/charging-station";

interface Props {
  station: ChargingStationDetail;
}

const StationPriceTable = ({ station }: Props) => {
  const rows = getChargerGroupRows(station);

  return (
    <div className="border-border-neutral-faint bg-surface-inverse-coolgray-stronger overflow-hidden rounded-2xl border">
      <table className="w-full border-collapse">
        <thead>
          <tr className="grid grid-cols-[30%_40%_30%] px-5">
            <th className="text-text-neutral-weak py-2 text-left text-sm font-semibold">
              속도
            </th>
            <th className="text-text-neutral-weak py-2 text-left text-sm font-semibold">
              충전 가능 대수
            </th>
            <th className="text-text-neutral-weak py-2 text-right text-sm font-semibold">
              회원가
            </th>
          </tr>
        </thead>
        <tbody className="bg-background-white block rounded-2xl px-5 py-1.5">
          {rows.map((row, index) => (
            <tr className="grid grid-cols-[30%_40%_30%]" key={row.key}>
              <td
                className={`text-text-neutral-stronger py-2 text-left text-sm font-semibold ${index < rows.length - 1 ? "border-border-neutral-weakest border-b" : ""}`}
              >
                {row.label}
              </td>
              <td
                className={`text-text-neutral-weak py-2 text-left text-sm font-semibold ${index < rows.length - 1 ? "border-border-neutral-weakest border-b" : ""}`}
              >
                <span className="text-text-primary-stronger">
                  {row.available}
                </span>
                <span> / {row.total}</span>
              </td>
              <td
                className={`text-text-neutral-stronger py-2 text-right text-sm font-semibold ${index < rows.length - 1 ? "border-border-neutral-weakest border-b" : ""}`}
              >
                280원
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default StationPriceTable;
