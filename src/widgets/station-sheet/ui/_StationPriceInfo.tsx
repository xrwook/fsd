import type { ChargingStationDetail } from "@/entities/charging-station";

import StationPriceTable from "./_StationPriceTable";

interface Props {
  station: ChargingStationDetail;
}

const StationPriceInfo = ({ station }: Props) => {
  return (
    <section className="px-4 pb-8">
      <StationPriceTable station={station} />
      <p className="text-text-neutral-weaker mt-2 px-px text-xs">
        · E-pit 회원 요금 기준이에요.
      </p>
    </section>
  );
};

export default StationPriceInfo;
