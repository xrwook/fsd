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
  return isSelfBrandCpo(station.cpoId)
    ? station.chargingSpeedGroupDivisionCount.groups.map((group) => ({
        key: group.groupName,
        label: group.groupName,
        available: group.availableCount,
        total: group.totalCount,
      }))
    : station.chargingSpeedDivisionCount.map((division) => ({
        key: `${division.availCpKw}`,
        label: `${division.availCpKw}kW`,
        available: division.availableCount,
        total: division.totalCount,
      }));
};

export const getStationEvses = (station: ChargingStationDetail): Evse[] => {
  return station.evseResponses.flatMap((response) => response.evses);
};
