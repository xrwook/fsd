import type {
  ChargerGroupRow,
  ChargingStationDetail,
  Evse,
} from "../model/types";

const SELF_BRAND_CPO_ID = "HY";

export const isSelfBrandCpo = (cpoId: string) => cpoId === SELF_BRAND_CPO_ID;

export const getChargerGroupRows = (
  station: ChargingStationDetail,
): ChargerGroupRow[] => {
  return station.chargingSpeedGroupDivisionCount.groups.map((group) => ({
    key: `${group.minPowerKw}-${group.maxPowerKw}`,
    label: group.groupName,
    available: group.availableCount,
    total: group.totalCount,
  }));
};

export const getStationEvses = (station: ChargingStationDetail): Evse[] => {
  return station.evseResponses.flatMap((response) => response.evses);
};
