import { type ComponentType, lazy, type LazyExoticComponent } from "react";

import { SCREEN_ID, type ScreenIdValues } from "@/shared/config";

type TMenuPageComponent = LazyExoticComponent<ComponentType>;
type TPageMap = Partial<Record<ScreenIdValues, TMenuPageComponent>>;

// API가 내려주는 url은 라우팅에 사용하고, 화면 컴포넌트 연결은 screenId 기준으로 관리합니다.
const pageMap: TPageMap = {
  [SCREEN_ID.DASHBOARD]: lazy(() => import("@/pages/home")),
  [SCREEN_ID.CPOS.CLEARING_HOUSE]: lazy(
    () => import("@/pages/CPOS/clearing-house"),
  ),
  [SCREEN_ID.CPOS.CHARGER_CONTROL]: lazy(
    () => import("@/pages/CPOS/charger-control"),
  ),
};

if (import.meta.env.VITE_BUILD_TARGET === "internal") {
  Object.assign(pageMap, {
    [SCREEN_ID.EMSP.MEMBER_INFO]: lazy(
      () => import("@/pages/eMSP/member-management/member-info"),
    ),
    [SCREEN_ID.EMSP.MEMBER_PAYMENT]: lazy(
      () => import("@/pages/eMSP/member-management/member-payment"),
    ),
    [SCREEN_ID.EMSP.CORPORATE_JOIN_MANAGEMENT]: lazy(
      () => import("@/pages/eMSP/corporate-member/corporate-join"),
    ),
    [SCREEN_ID.EMSP.CORPORATE_PAYMENT_SETTLEMENT]: lazy(
      () => import("@/pages/eMSP/corporate-member/payment-settlement"),
    ),
  });
}

export { pageMap };
