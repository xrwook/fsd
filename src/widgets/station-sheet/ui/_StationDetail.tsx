import { useRef, useState } from "react";

import type { ChargingStationDetail } from "@/entities/charging-station";
import { cn } from "@/shared/lib/tailwind";
import { Divider } from "@/shared/ui/divider";

import StationAddressInfo from "./_StationAddressInfo";
import StationChargingStatus from "./_StationChargingStatus";
import StationDetailHeader from "./_StationDetailHeader";
import StationInfoContent from "./_StationInfoContent";
import StationPriceInfo from "./_StationPriceInfo";

interface Props {
  station: ChargingStationDetail;
  onClose: () => void;
  className?: string;
}

type StationDetailTab = "chargingStatus" | "stationInfo";

const StationDetail = ({ station, onClose: handleClose, className }: Props) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const chargingStatusRef = useRef<HTMLDivElement>(null);
  const stationInfoRef = useRef<HTMLDivElement>(null);
  const [stationDetailTab, setStationDetailTab] =
    useState<StationDetailTab>("chargingStatus");

  const tabRefMap = {
    chargingStatus: chargingStatusRef,
    stationInfo: stationInfoRef,
  };

  const handleCopyAddress = () => {
    navigator.clipboard.writeText(station.address);
  };

  const handleTabChange = (value: StationDetailTab) => {
    const target = tabRefMap[value].current;

    setStationDetailTab(value);
    target?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div
      className={cn(
        "bg-background-white scrollbar-custom flex h-full flex-col overflow-y-auto",
        className,
      )}
      ref={scrollRef}
    >
      <div className="bg-background-white sticky top-0 z-10">
        <StationDetailHeader station={station} onClose={handleClose} />
      </div>

      <StationAddressInfo station={station} onCopyAddress={handleCopyAddress} />
      <StationPriceInfo station={station} />
      <Divider />

      <div className="bg-background-white sticky top-[116px] z-10 flex border-b border-gray-200 px-6">
        <button
          className={`relative h-12 flex-1 text-base font-medium ${stationDetailTab === "chargingStatus" ? "text-text-neutral-stronger" : "text-text-neutral-weak"}`}
          type="button"
          onClick={() => handleTabChange("chargingStatus")}
        >
          충전 현황
          {stationDetailTab === "chargingStatus" && (
            <span className="bg-surface-neutral-stronger absolute right-0 bottom-0 left-0 h-0.5" />
          )}
        </button>
        <button
          className={`relative h-12 flex-1 text-base font-medium ${stationDetailTab === "stationInfo" ? "text-text-neutral-stronger" : "text-text-neutral-weak"}`}
          type="button"
          onClick={() => handleTabChange("stationInfo")}
        >
          충전소 정보
          {stationDetailTab === "stationInfo" && (
            <span className="bg-surface-neutral-stronger absolute right-0 bottom-0 left-0 h-0.5" />
          )}
        </button>
      </div>

      <div data-tab="chargingStatus" ref={chargingStatusRef}>
        <StationChargingStatus station={station} />
      </div>
      <Divider />
      <div data-tab="stationInfo" ref={stationInfoRef}>
        <StationInfoContent
          station={station}
          onCopyAddress={handleCopyAddress}
        />
      </div>
    </div>
  );
};

export default StationDetail;
