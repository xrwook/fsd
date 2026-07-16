import { lazy } from "react";

import type { TExtraPageRouteGroups } from "./types";

// API 메뉴에 포함되지 않는 eMSP 상세/등록/수정 페이지입니다.
// 진입 및 화면 액션 권한은 parentMenuId에 해당하는 메뉴 권한을 사용합니다.
export const emspExtraPageRoutes = {
  "emsp-member-info": [
    {
      relativePath: "/:memberId",
      parentMenuId: "emsp-member-info",
      screenId: "emsp-member-info-detail",
      requirePermission: "canRead",
      pages: lazy(
        () => import("@/pages/eMSP/member-management/member-info-detail"),
      ),
    },
  ],
  "emsp-member-payment": [
    {
      relativePath: "/:memberId",
      parentMenuId: "emsp-member-payment",
      screenId: "emsp-member-payment-detail",
      requirePermission: "canRead",
      pages: lazy(
        () => import("@/pages/eMSP/member-management/member-payment"),
      ),
    },
  ],
} satisfies TExtraPageRouteGroups;
