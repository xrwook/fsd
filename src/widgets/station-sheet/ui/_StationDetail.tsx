import { useEffect, useMemo, useRef, useState } from "react";

import type { ChargingStationDetail } from "@/entities/charging-station";
import { cn } from "@/shared/lib/tailwind";
import { Divider } from "@/shared/ui/divider";
import { AppTabBasic, AppTabBasicList } from "@/shared/ui/tab";

import type { StationDetailTab } from "../model/station";
import { StationAddressInfo } from "./_StationAddressInfo";
import { StationChargingStatus } from "./_StationChargingStatus";
import { StationDetailHeader } from "./_StationDetailHeader";
import { StationInfoContent } from "./_StationInfoContent";
import { StationPriceInfo } from "./_StationPriceInfo";

interface Props {
  station: ChargingStationDetail;
  onClose: () => void;
  onRefresh: () => Promise<ChargingStationDetail | undefined>;
  className?: string;
}

export const StationDetail = ({
  station,
  onClose: handleClose,
  onRefresh,
  className,
}: Props) => {
  const [chargeStationTab, setChargeStationTab] =
    useState<StationDetailTab>("chargingStatus");
  const [currentStation, setCurrentStation] = useState(station);
  const chargeStationDetailScrollRef = useRef<HTMLDivElement>(null);
  const stationChargingStatusRef = useRef<HTMLDivElement>(null);
  const stationInfoContentRef = useRef<HTMLDivElement>(null);
  const heightElementRef = useRef<HTMLDivElement>(null);
  const [refHeight, setRefHeight] = useState(0);

  const chargeStationTabRefMap = useMemo(
    () => ({
      chargingStatus: stationChargingStatusRef,
      stationInfo: stationInfoContentRef,
    }),
    [],
  );

  const handleRefresh = async () => {
    const refreshedStation = await onRefresh();
    if (!refreshedStation) return false;

    setCurrentStation(refreshedStation);
    return true;
  };

  const handleTabChange = (value: StationDetailTab) => {
    setChargeStationTab(value);

    const container = chargeStationDetailScrollRef.current;
    const target = chargeStationTabRefMap[value]?.current;
    if (!container || !target) return;

    const scrollTop = target.offsetTop - refHeight - 70;
    container.scrollTo({ top: scrollTop, behavior: "smooth" });
  };

  useEffect(() => {
    setCurrentStation(station);
  }, [station]);

  useEffect(() => {
    const element = heightElementRef.current;
    if (!element) return;

    const resizeObserver = new ResizeObserver(() => {
      setRefHeight(element.offsetHeight);
    });

    setRefHeight(element.offsetHeight);
    resizeObserver.observe(element);

    return () => resizeObserver.disconnect();
  }, []);

  useEffect(() => {
    const container = chargeStationDetailScrollRef.current;
    if (!container) return;

    const visibleHeight = container.clientHeight - refHeight - 70;
    const top = 70 + Math.floor(visibleHeight / 3);
    const bottom = Math.max(container.clientHeight - top - 1, 0);

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting && entry.target instanceof HTMLElement) {
            setChargeStationTab(entry.target.dataset.tab as StationDetailTab);
          }
        }
      },
      {
        root: container,
        rootMargin: `-${top}px 0px -${bottom}px 0px`,
        threshold: 0,
      },
    );

    for (const tab of Object.keys(
      chargeStationTabRefMap,
    ) as StationDetailTab[]) {
      const element = chargeStationTabRefMap[tab].current;
      if (element) observer.observe(element);
    }

    return () => observer.disconnect();
  }, [chargeStationTabRefMap, refHeight]);

  return (
    <div
      className={cn("scrollbar-custom flex flex-col bg-[#F5F7FA]", className)}
      ref={chargeStationDetailScrollRef}
    >
      <div
        className="bg-background-coolgray-weakest sticky top-0 z-55"
        ref={heightElementRef}
      >
        <StationDetailHeader station={currentStation} onClose={handleClose} />
      </div>

      <div className="relative flex-1">
        <StationAddressInfo station={currentStation} />
        <StationPriceInfo station={currentStation} />
        <Divider />

        <div className="sticky z-50" style={{ top: refHeight }}>
          <AppTabBasicList
            bg="white"
            className="border-border-neutral-weakest border-b"
            mode="fill"
            value={chargeStationTab}
            onChange={(value) => handleTabChange(value as StationDetailTab)}
          >
            <AppTabBasic value="chargingStatus">충전 현황</AppTabBasic>
            <AppTabBasic value="stationInfo">충전소 정보</AppTabBasic>
          </AppTabBasicList>
        </div>

        <div className="bg-background-white flex flex-col px-4 pt-8 pb-10">
          <div data-tab="chargingStatus" ref={stationChargingStatusRef}>
            <StationChargingStatus
              station={currentStation}
              onRefresh={handleRefresh}
            />
          </div>

          <Divider className="my-8" />

          <div data-tab="stationInfo" ref={stationInfoContentRef}>
            <StationInfoContent station={currentStation} />
          </div>
        </div>
      </div>
    </div>
  );
};
