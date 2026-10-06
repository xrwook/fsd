import type {
  ChargingStationDetail,
  RawStationRecord,
  SearchStationResultProps,
} from "../model/station-search";

export const stationDetailMock: ChargingStationDetail = {
  locationId: "1",
  name: "현대 백화점 신촌관(본관)",
  cpoId: "HY",
  cpoName: "현대자동차",
  latitude: 37.508_87,
  longitude: 127.063_19,
  roadAddress: "서울특별시 서대문구 신촌로 83",
  address: "서울특별시 서대문구 신촌로 83",
  addressDetail: "지상 3층 A02번 기둥",
  chargingSpeedDivisionCount: [
    { availCpkW: 7, availableCount: 1, totalCount: 3 },
    { availCpkW: 50, availableCount: 1, totalCount: 2 },
  ],
  chargingSpeedGroupDivisionCount: {
    groups: [
      {
        groupName: "완속",
        minPowerKw: 0,
        maxPowerKw: 49,
        availableCount: 1,
        totalCount: 3,
      },
      {
        groupName: "급속",
        minPowerKw: 50,
        maxPowerKw: 99,
        availableCount: 1,
        totalCount: 2,
      },
    ],
  },
  distanceMeters: 300,
  publicOpenYn: true,
  parkingType: "FREE",
  qrScanYn: true,
  pncYn: true,
  imageUrls: [
    "/images/graphics/GR_ChargeStationDetailDummyImg.jpg",
    "/images/graphics/GR_ChargeStationDetailDummyImg.jpg",
  ],
  csId: "000001",
  openingTimes: "24시간 운영",
  tellNumber: "02-338-1234",
  evseResponses: [
    {
      availCpkW: 7,
      evses: [
        {
          cpId: "EVSE-1-1",
          cpName: "1번 충전기",
          chargerType: "AC_SLOW",
          availCpkW: 7,
          status: "AVAILABLE",
          chargeEndDate: "2026-08-27T10:16:05.690Z",
        },
      ],
    },
    {
      availCpkW: 50,
      evses: [
        {
          cpId: "EVSE-1-2",
          cpName: "2번 충전기",
          chargerType: "DC_COMBO",
          availCpkW: 50,
          status: "CHARGING",
          chargeEndDate: "2026-08-27T10:16:05.690Z",
        },
      ],
    },
  ],
};

export const stationList: RawStationRecord[] = [
  {
    locationId: "1",
    locationStatus: "AVAILABLE",
    name: "현대 백화점 신촌관(본관)",
    cpoId: "HY",
    cpoName: "현대자동차",
    latitude: 37.508_87,
    longitude: 127.063_19,
    roadAddress: "서울특별시 서대문구 신촌로 83",
    address: "서울특별시 서대문구 신촌로 83",
    addressDetail: "지상 3층 A02번 기둥",
    chargingSpeedDivisionCount: [
      { availCpkW: 7, availableCount: 1, totalCount: 3 },
      { availCpkW: 50, availableCount: 1, totalCount: 2 },
    ],
    chargingSpeedGroupDivisionCount: {
      groups: [
        {
          groupName: "완속",
          minPowerKw: 0,
          maxPowerKw: 49,
          availableCount: 1,
          totalCount: 3,
        },
        {
          groupName: "급속",
          minPowerKw: 50,
          maxPowerKw: 99,
          availableCount: 1,
          totalCount: 2,
        },
      ],
    },
    eventDiscountRate: 10,
    distanceMeters: 300,
    radiusMeters: 3000,
    publicOpenYn: true,
    parkingType: "FREE",
    parkingFeeYn: false,
    qrScanYn: true,
    pncYn: true,
    imageUrls: [
      "/images/graphics/GR_ChargeStationDetailDummyImg.jpg",
      "/images/graphics/GR_ChargeStationDetailDummyImg.jpg",
    ],
    csId: "000001",
    openingTimes: "24시간 운영",
    tellNumber: "02-338-1234",
    evseResponses: [
      {
        availCpkW: 7,
        evses: [
          {
            cpId: "EVSE-1-1",
            cpName: "1번 충전기",
            chargerType: "AC_SLOW",
            availCpkW: 7,
            status: "AVAILABLE",
            chargeEndDate: "2026-08-27T10:16:05.690Z",
          },
        ],
      },
      {
        availCpkW: 50,
        evses: [
          {
            cpId: "EVSE-1-2",
            cpName: "2번 충전기",
            chargerType: "DC_COMBO",
            availCpkW: 50,
            status: "CHARGING",
            chargeEndDate: "2026-08-27T10:16:05.690Z",
          },
        ],
      },
    ],
  },
  {
    locationId: "2",
    locationStatus: "AVAILABLE",
    name: "신촌 세브란스 충전소",
    cpoId: "ROAM-01",
    cpoName: "사업자명",
    latitude: 37.510_23,
    longitude: 127.065_41,
    roadAddress: "서울특별시 서대문구 연세로 12",
    address: "서울특별시 서대문구 연세로 12",
    addressDetail: "지하 1층 주차장",
    chargingSpeedDivisionCount: [
      { availCpkW: 7, availableCount: 2, totalCount: 2 },
    ],
    chargingSpeedGroupDivisionCount: {
      groups: [
        {
          groupName: "완속",
          minPowerKw: 0,
          maxPowerKw: 49,
          availableCount: 2,
          totalCount: 2,
        },
      ],
    },
    csId: "000002",
  },
];

export const StationSearchMock: SearchStationResultProps[] = stationList.map(
  (station) => ({
    address: station.address,
    id: station.locationId,
    name: station.name,
  }),
);
