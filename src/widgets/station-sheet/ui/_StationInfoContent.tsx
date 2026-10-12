import { useState } from "react";

import {
  type ChargingStationDetail,
  getChargerGroupRows,
  isSelfBrandCpo,
} from "@/entities/charging-station";
import {
  Call20Icon,
  ExBenefit16Icon,
  Parking20Icon,
  Pin20Icon,
  Station20Icon,
  Time20Icon,
} from "@/shared/assets/icons";
import { AppTextButton } from "@/shared/ui/button";
import { Divider } from "@/shared/ui/divider";
import { ImageBanner } from "@/shared/ui/image-banner";
import { TabSegmented, TabSegmentedList } from "@/shared/ui/tab";
import {
  AppTableCaption,
  AppTableCell,
  AppTableHeaderCell,
} from "@/shared/ui/table";

import type { StationInfoTab } from "../model/station";

interface Props {
  station: ChargingStationDetail;
  onCopyAddress?: () => void;
}

export const StationInfoContent = ({ onCopyAddress, station }: Props) => {
  const [chargeStationInfoTab, setChargeStationInfoTab] =
    useState<StationInfoTab>("basicInfo");
  const isSelfBrand = isSelfBrandCpo(station.cpoId);
  const costRows = getChargerGroupRows(station);
  const handleCopyAddress = onCopyAddress;

  const handleCallClick = () => {
    location.href = `tel:${station.tellNumber}`;
  };

  return (
    <>
      <div className="flex justify-between px-2">
        <div className="flex items-center gap-1">
          <p className="text-text-neutral-stronger text-base font-semibold">
            충전소 정보
          </p>
        </div>
      </div>

      <TabSegmentedList
        className="mt-4"
        color="white"
        value={chargeStationInfoTab}
        onChange={(value: string) =>
          setChargeStationInfoTab(value as StationInfoTab)
        }
      >
        <TabSegmented value="basicInfo">기본 정보</TabSegmented>
        <TabSegmented value="costInfo">충전 요금</TabSegmented>
      </TabSegmentedList>

      <div className="mt-4">
        {chargeStationInfoTab === "basicInfo" && (
          <div className="mb-5 pt-2">
            <ImageBanner
              items={(station.imageUrls.length > 0
                ? station.imageUrls
                : [
                    "/images/graphics/GR_ChargeStationDetailDummyImg.jpg",
                    "/images/graphics/GR_ChargeStationDetailDummyImg.jpg",
                  ]
              ).map((imageUrl) => ({
                type: "link" as const,
                imgUrl: imageUrl,
                alt: "충전소 이미지",
              }))}
            />

            <div className="flex flex-col">
              <dl className="px-2 py-4">
                <dt className="text-icon-neutral-weaker flex items-center gap-1.5">
                  <Pin20Icon aria-hidden className="size-4" />
                  <span className="text-sm font-medium">위치</span>
                </dt>
                <dd className="mt-2">
                  <div className="flex items-center gap-1">
                    <span className="text-text-neutral-stronger text-base font-medium">
                      {station.address}
                    </span>
                    <AppTextButton
                      color="primary"
                      size="medium"
                      onClick={handleCopyAddress}
                    >
                      복사
                    </AppTextButton>
                  </div>
                  <span className="text-text-neutral-stronger text-base font-medium">
                    {station.addressDetail}
                  </span>
                </dd>
              </dl>

              <Divider />

              <dl className="px-2 py-4">
                <dt className="text-icon-neutral-weaker flex items-center gap-1.5">
                  <Time20Icon aria-hidden className="size-4" />
                  <span className="text-sm font-medium">운영시간</span>
                </dt>
                <dd className="typo-body-16-medium mt-2 whitespace-pre-line">
                  {station.openingTimes ? (
                    <span className="text-text-neutral-stronger">
                      {station.openingTimes}
                    </span>
                  ) : (
                    <span className="text-text-neutral-weaker">
                      운영시간 정보가 없어요.
                    </span>
                  )}
                </dd>
              </dl>

              <Divider />

              <dl className="px-2 py-4">
                <dt className="text-icon-neutral-weaker flex items-center gap-1.5">
                  <Parking20Icon aria-hidden className="size-4" />
                  <span className="text-sm font-medium">주차 요금</span>
                </dt>
                <dd className="mt-2 text-base font-medium whitespace-pre-line">
                  {station.parkingType === "FREE" ? (
                    <span className="text-text-neutral-stronger">
                      무료 주차
                    </span>
                  ) : (
                    <span className="text-text-neutral-stronger">
                      유료. 충전 고객 1시간 무료, 이후 50% 감면
                    </span>
                  )}
                </dd>
              </dl>

              <Divider />

              <dl className="px-2 py-4">
                <dt className="text-icon-neutral-weaker flex items-center gap-1.5">
                  <Station20Icon aria-hidden className="size-4" />
                  <span className="text-sm font-medium">운영 기관</span>
                </dt>
                <dd className="text-text-neutral-stronger mt-2 text-base font-medium whitespace-pre-line">
                  {isSelfBrand ? "E-pit" : station.cpoName}
                </dd>
              </dl>

              <Divider />

              <dl className="px-2 py-4">
                <dt className="text-icon-neutral-weaker flex items-center gap-1.5">
                  <Call20Icon aria-hidden className="size-4" />
                  <span className="text-sm font-medium">전화번호</span>
                </dt>
                <dd className="mt-2 text-base font-medium whitespace-pre-line">
                  {station.tellNumber ? (
                    <div className="inline-flex gap-1">
                      <span className="text-text-neutral-stronger">
                        {station.tellNumber}
                      </span>
                      <AppTextButton
                        color="primary"
                        size="medium"
                        onClick={handleCallClick}
                      >
                        전화
                      </AppTextButton>
                    </div>
                  ) : (
                    <span className="text-text-neutral-weaker">
                      전화번호 정보가 없어요.
                    </span>
                  )}
                </dd>
              </dl>
              <Divider />
            </div>
          </div>
        )}

        {chargeStationInfoTab === "costInfo" && (
          <table className="w-full">
            <AppTableCaption
              captions={["원/kWh", "부가세 포함"]}
              className="mt-3"
            />
            <thead>
              <tr>
                <AppTableHeaderCell align="left" type="text">
                  구분
                </AppTableHeaderCell>
                <AppTableHeaderCell align="right" type="text">
                  비회원가
                </AppTableHeaderCell>
                <AppTableHeaderCell align="right" type="text">
                  회원가
                </AppTableHeaderCell>
                <AppTableHeaderCell
                  align="right"
                  icon={<ExBenefit16Icon />}
                  type="accentText"
                >
                  내 혜택가
                </AppTableHeaderCell>
              </tr>
            </thead>
            <tbody>
              {costRows.map((row) => (
                <tr key={row.key}>
                  <AppTableCell align="left" type="text">
                    {row.label}
                  </AppTableCell>
                  {/* TODO: 요금 API 미연동. 실제 가격 확정 전까지 하드코딩 유지 */}
                  <AppTableCell align="right" type="text">
                    480원
                  </AppTableCell>
                  <AppTableCell align="right" type="text">
                    420원
                  </AppTableCell>
                  <AppTableCell align="right" type="accentText">
                    310원
                  </AppTableCell>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
};
