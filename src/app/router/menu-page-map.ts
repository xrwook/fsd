import type { ComponentType, LazyExoticComponent } from "react";
import { lazy } from "react";

type TMenuPageProps = {};
type TMenuPageComponent = LazyExoticComponent<ComponentType<TMenuPageProps>>;
type TPageMap = Partial<Record<string, TMenuPageComponent>>;

// API가 내려주는 url을 기준으로 화면 컴포넌트를 연결합니다.
export const pageMap: TPageMap = {
  "/": lazy(() => import("@/pages/home")),
  "/emsp/member-management/members": lazy(
    () => import("@/pages/eMSP/member-management/member-info"),
  ),
  "/emsp/member-management/member-payment": lazy(
    () => import("@/pages/eMSP/member-management/member-payment"),
  ),
  "/emsp/corporate-member/corporate-join": lazy(
    () => import("@/pages/eMSP/corporate-member/corporate-join"),
  ),
  "/emsp/corporate-member/payment-settlement": lazy(
    () => import("@/pages/eMSP/corporate-member/payment-settlement"),
  ),
};
