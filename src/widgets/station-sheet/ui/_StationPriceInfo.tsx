import type { ChargingStationDetail } from "@/entities/charging-station";
import { cn } from "@/shared/lib/tailwind";
import { InformationTextDesc } from "@/shared/ui/information-text";

import { StationPriceTable } from "./_StationPriceTable";

interface Props {
  station: ChargingStationDetail;
}

export const StationPriceInfo = ({ station }: Props) => {
  return (
    <div
      className={cn(
        "overflow-hidden px-4 pb-8 opacity-100 transition-[opacity,height] delay-[0ms,150ms] duration-150",
      )}
    >
      <StationPriceTable station={station} />
      <InformationTextDesc
        className="mx-px mt-2.25"
        items={["E-pit 회원 요금 기준이에요."]}
      />
    </div>
  );
};
