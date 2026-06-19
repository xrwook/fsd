import type { ComponentType, LazyExoticComponent } from "react";
import { lazy } from "react";

import type { TMenuId } from "@/entities/user";
import { MENU_ID } from "@/entities/user";

type TMenuPageComponent = LazyExoticComponent<ComponentType>;

// API가 내려주는 url은 런타임에 바뀔 수 있으므로, 화면 컴포넌트는 고정된 menuId 기준으로 연결합니다.
export const pageMap: Partial<Record<TMenuId, TMenuPageComponent>> = {
  [MENU_ID.DASHBOARD]: lazy(() => import("@/pages/home")),
  [MENU_ID.EMSP_MEMBER_INFO]: lazy(
    () => import("@/pages/eMSP/member-management/member-info"),
  ),
  [MENU_ID.EMSP_MEMBER_PAYMENT]: lazy(
    () => import("@/pages/eMSP/member-management/member-payment"),
  ),
  [MENU_ID.EMSP_CORPORATE_JOIN_MANAGEMENT]: lazy(
    () => import("@/pages/eMSP/corporate-member/corporate-join"),
  ),
  [MENU_ID.EMSP_CORPORATE_PAYMENT_SETTLEMENT]: lazy(
    () => import("@/pages/eMSP/corporate-member/payment-settlement"),
  ),
};
