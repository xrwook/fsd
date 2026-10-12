import AccessTimeIcon from "@mui/icons-material/AccessTime";
import ApartmentIcon from "@mui/icons-material/Apartment";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import LocalOfferIcon from "@mui/icons-material/LocalOffer";
import LocalParkingIcon from "@mui/icons-material/LocalParking";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import PhoneIcon from "@mui/icons-material/Phone";
import { useState } from "react";

import type { ChargingStationDetail } from "@/entities/charging-station";
import {
  getChargerGroupRows,
  isSelfBrandCpo,
} from "@/entities/charging-station";
import { Divider } from "@/shared/ui/divider";

interface Props {
  station: ChargingStationDetail;
  onCopyAddress?: () => void;
}

type StationInfoTab = "basicInfo" | "costInfo";

const PARKING_TYPE_DESCRIPTION: Record<string, string> = {
  FREE: "무료 주차",
  PUBLIC: "공영 주차장 요금이 적용돼요.",
  GOVERNMENT: "시설 주차 요금이 적용돼요.",
  OPTIONAL_FREE: "충전 고객에게 조건부 무료 주차가 제공돼요.",
};

const InfoTitle = ({
  icon,
  children,
}: {
  icon: React.ReactNode;
  children: React.ReactNode;
}) => (
  <dt className="text-icon-neutral-weaker flex items-center gap-1.5">
    {icon}
    <span className="text-text-neutral-stronger text-sm font-medium">
      {children}
    </span>
  </dt>
);

const StationInfoContent = ({ station, onCopyAddress }: Props) => {
  const [stationInfoTab, setStationInfoTab] =
    useState<StationInfoTab>("basicInfo");

  const isSelfBrand = isSelfBrandCpo(station.cpoId);
  const costRows = getChargerGroupRows(station);
  const parkingDescription =
    PARKING_TYPE_DESCRIPTION[station.parkingType] ?? station.parkingType;

  const handleCallClick = () => {
    globalThis.location.href = `tel:${station.tellNumber}`;
  };

  return (
    <section className="px-4 pt-8 pb-10">
      <div className="flex items-center justify-between px-2">
        <h3 className="text-text-neutral-stronger text-base font-semibold">
          충전소 정보
        </h3>
      </div>

      <div className="mt-4 flex rounded-xl bg-gray-100 p-1">
        <button
          className={`h-10 flex-1 rounded-lg text-sm font-semibold ${stationInfoTab === "basicInfo" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500"}`}
          type="button"
          onClick={() => setStationInfoTab("basicInfo")}
        >
          기본 정보
        </button>
        <button
          className={`h-10 flex-1 rounded-lg text-sm font-semibold ${stationInfoTab === "costInfo" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500"}`}
          type="button"
          onClick={() => setStationInfoTab("costInfo")}
        >
          충전 요금
        </button>
      </div>

      <div className="mt-4">
        {stationInfoTab === "basicInfo" ? (
          <div>
            {station.imageUrls.length > 0 && (
              <div className="mb-5 flex snap-x gap-2 overflow-x-auto">
                {station.imageUrls.map((imageUrl, index) => (
                  <img
                    alt={`${station.name} 충전소 이미지 ${index + 1}`}
                    className="h-36 min-w-[85%] snap-center rounded-2xl object-cover"
                    key={`${imageUrl}-${index}`}
                    src={imageUrl}
                  />
                ))}
              </div>
            )}

            <dl>
              <div className="px-2 py-4">
                <InfoTitle icon={<LocationOnIcon fontSize="small" />}>
                  위치
                </InfoTitle>
                <dd className="mt-2 text-base font-medium">
                  <div className="flex items-center gap-1">
                    <span>{station.address}</span>
                    <button
                      aria-label="주소 복사"
                      className="text-text-primary-stronger inline-flex items-center gap-1 text-sm font-semibold"
                      type="button"
                      onClick={onCopyAddress}
                    >
                      <ContentCopyIcon sx={{ fontSize: 16 }} /> 복사
                    </button>
                  </div>
                  <span className="text-text-neutral-stronger mt-1 block">
                    {station.addressDetail}
                  </span>
                </dd>
              </div>

              <Divider />

              <div className="px-2 py-4">
                <InfoTitle icon={<AccessTimeIcon fontSize="small" />}>
                  운영시간
                </InfoTitle>
                <dd className="mt-2 text-base font-medium">
                  {station.openingTimes || (
                    <span className="text-text-neutral-weaker">
                      운영시간 정보가 없어요.
                    </span>
                  )}
                </dd>
              </div>

              <Divider />

              <div className="px-2 py-4">
                <InfoTitle icon={<LocalParkingIcon fontSize="small" />}>
                  주차 요금
                </InfoTitle>
                <dd className="mt-2 text-base font-medium">
                  {parkingDescription}
                </dd>
              </div>

              <Divider />

              <div className="px-2 py-4">
                <InfoTitle icon={<ApartmentIcon fontSize="small" />}>
                  운영 기관
                </InfoTitle>
                <dd className="mt-2 text-base font-medium">
                  {isSelfBrand ? "E-pit" : station.cpoName}
                </dd>
              </div>

              <Divider />

              <div className="px-2 py-4">
                <InfoTitle icon={<PhoneIcon fontSize="small" />}>
                  전화번호
                </InfoTitle>
                <dd className="mt-2 text-base font-medium">
                  {station.tellNumber ? (
                    <div className="flex items-center gap-1">
                      <span>{station.tellNumber}</span>
                      <button
                        className="text-text-primary-stronger text-sm font-semibold"
                        type="button"
                        onClick={handleCallClick}
                      >
                        전화
                      </button>
                    </div>
                  ) : (
                    <span className="text-text-neutral-weaker">
                      전화번호 정보가 없어요.
                    </span>
                  )}
                </dd>
              </div>
            </dl>
          </div>
        ) : (
          <div>
            <div className="text-text-neutral-weaker mt-3 flex items-center gap-1 text-xs">
              <LocalOfferIcon sx={{ fontSize: 16 }} />
              <span>원/kWh · 부가세 포함</span>
            </div>
            <table className="mt-3 w-full">
              <thead>
                <tr>
                  <th className="py-2 text-left text-sm font-medium">구분</th>
                  <th className="py-2 text-right text-sm font-medium">
                    비회원가
                  </th>
                  <th className="py-2 text-right text-sm font-medium">
                    회원가
                  </th>
                  <th className="text-text-primary-stronger py-2 text-right text-sm font-medium">
                    내 혜택가
                  </th>
                </tr>
              </thead>
              <tbody>
                {costRows.map((row) => (
                  <tr className="border-t border-gray-100" key={row.key}>
                    <td className="py-3 text-left text-sm">{row.label}</td>
                    <td className="py-3 text-right text-sm">480원</td>
                    <td className="py-3 text-right text-sm">420원</td>
                    <td className="text-text-primary-stronger py-3 text-right text-sm font-semibold">
                      310원
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  );
};

export default StationInfoContent;
