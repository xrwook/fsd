import { lazy } from "react";

import { SCREEN_ID } from "@/shared/config";

import type { TExtraPageRouteGroups } from "./types";

// API 메뉴에 포함되지 않는 eMSP 상세/등록/수정 페이지입니다.
// 진입 및 화면 액션 권한은 parentMenuId에 해당하는 메뉴 권한을 사용합니다.
export const emspExtraPageRoutes = {
  [SCREEN_ID.EMSP.MEMBER_INFO]: [
    {
      relativePath: "/:id",
      parentScreenId: SCREEN_ID.EMSP.MEMBER_INFO,
      screenId: SCREEN_ID.EMSP.MEMBER_INFO_DETAIL,
      requirePermission: "canRead",
      pages: lazy(
        () => import("@/pages/eMSP/member-management/member-info-detail"),
      ),
    },
  ],
  [SCREEN_ID.EMSP.MEMBER_PAYMENT]: [
    {
      relativePath: "/:id",
      parentScreenId: SCREEN_ID.EMSP.MEMBER_PAYMENT,
      screenId: SCREEN_ID.EMSP.MEMBER_PAYMENT_DETAIL,
      requirePermission: "canRead",
      pages: lazy(
        () => import("@/pages/eMSP/member-management/member-payment"),
      ),
    },
  ],
} satisfies TExtraPageRouteGroups;
