import type {
  ChargerGroupRow,
  ChargerGroupRowWithEvses,
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

export const getChargerGroupRowsWithEvses = (
  station: ChargingStationDetail,
): ChargerGroupRowWithEvses[] => {
  if (!isSelfBrandCpo(station.cpoId)) {
    return station.chargingSpeedDivisionCount.map((division) => ({
      key: `${division.availCpKw}`,
      label: `${division.availCpKw}kW`,
      available: division.availableCount,
      total: division.totalCount,
      evseResponses: station.evseResponses.filter(
        (response) => response.availCpKw === division.availCpKw,
      ),
    }));
  }

  const groups = station.chargingSpeedGroupDivisionCount.groups;

  return groups.map((group, index) => ({
    key: group.groupName,
    label: group.groupName,
    available: group.availableCount,
    total: group.totalCount,
    evseResponses: station.evseResponses.filter((response) => {
      const isLastGroup = index === groups.length - 1;
      const isAtLeastMinimum = response.availCpKw >= group.minPowerKw;
      const isBelowMaximum = isLastGroup
        ? response.availCpKw <= group.maxPowerKw
        : response.availCpKw < group.maxPowerKw;

      return isAtLeastMinimum && isBelowMaximum;
    }),
  }));
};

export const getStationEvses = (station: ChargingStationDetail): Evse[] => {
  return station.evseResponses.flatMap((response) => response.evses);
};
