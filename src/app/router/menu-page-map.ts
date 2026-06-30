import type { ComponentType, LazyExoticComponent } from "react";
import { lazy } from "react";

import { MENU_ID, type TMenuId } from "@/entities/user";
type props = {
}
type TMenuPageComponent = LazyExoticComponent<ComponentType<props>>;
type TPageMap = Partial<Record<TMenuId, TMenuPageComponent>>;

// API가 내려주는 url은 런타임에 바뀔 수 있으므로, 화면 컴포넌트는 고정된 menuId 기준으로 연결합니다.
export const pageMap: TPageMap = {
  [MENU_ID.DASHBOARD]: lazy(() => import("@/pages/home")),
  [MENU_ID.EMSP.EMSP_MEMBER_INFO]: lazy(
    () => import("@/pages/eMSP/member-management/member-info"),
  ),
  [MENU_ID.EMSP.EMSP_MEMBER_PAYMENT]: lazy(
    () => import("@/pages/eMSP/member-management/member-payment"),
  ),
  [MENU_ID.EMSP.EMSP_CORPORATE_JOIN_MANAGEMENT]: lazy(
    () => import("@/pages/eMSP/corporate-member/corporate-join"),
  ),
  [MENU_ID.EMSP.EMSP_CORPORATE_PAYMENT_SETTLEMENT]: lazy(
    () => import("@/pages/eMSP/corporate-member/payment-settlement"),
  ),
};
