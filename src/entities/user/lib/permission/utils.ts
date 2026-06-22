import { flattenTree } from "@/shared/lib/utils";

import { MENU_ID } from "./menuIds";
import type {
  TMenuId,
  TMenuPermission,
  TMenuPermissionApiResponse,
  TPermissionKey,
} from "./types";

// 실제 API가 내려주는 메뉴 트리 형태를 유지한 권한 mock 데이터입니다.
export const permissionMenuMock: TMenuPermissionApiResponse = {
  permissionName: "새로운권한",
  permissionDescription: "새로운권한입니다.",
  permissions: [
    {
      id: MENU_ID.DASHBOARD,
      parentId: null,
      depth: 1,
      name: "Dashboard",
      type: "folder",
      url: "/",
      expanded: true,
      checked: true,
      permissions: {
        read: true,
        write: true,
        download: true,
      },
      children: [],
    },
    {
      id: MENU_ID.CPOS,
      parentId: null,
      depth: 1,
      name: "CPOS",
      type: "folder",
      expanded: true,
      checked: false,
      permissions: {
        read: true,
        write: true,
        download: true,
      },
      children: [
        {
          id: MENU_ID.STATION_ROOT,
          parentId: MENU_ID.CPOS,
          depth: 2,
          name: "충전소 관리",
          type: "folder",
          expanded: true,
          checked: false,
          permissions: {
            read: true,
            write: true,
            download: true,
          },
          children: [
            {
              id: MENU_ID.STATION_MANAGEMENT,
              parentId: MENU_ID.STATION_ROOT,
              depth: 3,
              name: "충전소 관리",
              type: "menu",
              checked: true,
              permissions: {
                read: true,
                write: false,
                download: true,
              },
            },
            {
              id: MENU_ID.STATION_FEE_MANAGEMENT,
              parentId: MENU_ID.STATION_ROOT,
              depth: 3,
              name: "충전소 요금 관리",
              type: "menu",
              checked: false,
              permissions: {
                read: false,
                write: false,
                download: false,
              },
            },
            {
              id: MENU_ID.POWER_BANK_MANAGEMENT,
              parentId: MENU_ID.STATION_ROOT,
              depth: 3,
              name: "파워 뱅크 관리",
              type: "menu",
              checked: true,
              permissions: {
                read: true,
                write: true,
                download: true,
              },
            },
          ],
        },
        {
          id: MENU_ID.CHARGER_ROOT,
          parentId: MENU_ID.CPOS,
          depth: 2,
          name: "충전기 관리",
          type: "folder",
          expanded: true,
          checked: true,
          permissions: {
            read: true,
            write: true,
            download: true,
          },
          children: [
            {
              id: MENU_ID.M2M_MODEM_MANAGEMENT,
              parentId: MENU_ID.CHARGER_ROOT,
              depth: 3,
              name: "M2M모뎀 관리",
              type: "menu",
              checked: false,
              permissions: {
                read: false,
                write: false,
                download: false,
              },
            },
            {
              id: MENU_ID.CHARGER_STATUS,
              parentId: MENU_ID.CHARGER_ROOT,
              depth: 3,
              name: "충전기 상태",
              type: "menu",
              checked: false,
              permissions: {
                read: false,
                write: false,
                download: false,
              },
            },
            {
              id: MENU_ID.CHARGER_CONTROL,
              parentId: MENU_ID.CHARGER_ROOT,
              depth: 3,
              name: "충전기 제어",
              type: "menu",
              checked: false,
              permissions: {
                read: false,
                write: false,
                download: false,
              },
            },
            {
              id: MENU_ID.CHARGER_ERROR_MANAGEMENT,
              parentId: MENU_ID.CHARGER_ROOT,
              depth: 3,
              name: "충전기 고장 관리",
              type: "menu",
              checked: true,
              permissions: {
                read: true,
                write: true,
                download: true,
              },
            },
          ],
        },
      ],
    },
    {
      id: MENU_ID.CLEARING_HOUSE,
      parentId: null,
      depth: 1,
      name: "Clearing House",
      type: "folder",
      expanded: false,
      checked: false,
      permissions: {
        read: false,
        write: false,
        download: false,
      },
      children: [],
    },
    {
      id: MENU_ID.EMSP,
      parentId: null,
      depth: 1,
      name: "eMSP",
      type: "folder",
      expanded: true,
      checked: false,
      permissions: {
        read: false,
        write: false,
        download: false,
      },
      children: [
        {
          id: MENU_ID.EMSP_MEMBER_MANAGEMENT,
          parentId: MENU_ID.EMSP,
          depth: 2,
          name: "회원관리",
          type: "folder",
          expanded: true,
          checked: false,
          permissions: {
            read: false,
            write: false,
            download: false,
          },
          children: [
            {
              id: MENU_ID.EMSP_MEMBER_INFO,
              parentId: MENU_ID.EMSP_MEMBER_MANAGEMENT,
              depth: 3,
              name: "회원정보",
              type: "menu",
              url: "/emsp/member-management/members",
              checked: false,
              permissions: {
                read: true,
                write: false,
                download: false,
              },
            },
            {
              id: MENU_ID.EMSP_MEMBER_PAYMENT,
              parentId: MENU_ID.EMSP_MEMBER_MANAGEMENT,
              depth: 3,
              name: "결제",
              type: "menu",
              url: "/emsp/member-management/member-payment",
              checked: false,
              permissions: {
                read: false,
                write: false,
                download: false,
              },
            },
          ],
        },
        {
          id: MENU_ID.EMSP_CORPORATE_MEMBER,
          parentId: MENU_ID.EMSP,
          depth: 2,
          name: "법인회원",
          type: "folder",
          expanded: true,
          checked: false,
          permissions: {
            read: true,
            write: false,
            download: false,
          },
          children: [
            {
              id: MENU_ID.EMSP_CORPORATE_JOIN_MANAGEMENT,
              parentId: MENU_ID.EMSP_CORPORATE_MEMBER,
              depth: 3,
              name: "가입관리",
              type: "menu",
              url: "/emsp/corporate-member/corporate-join",
              checked: false,
              permissions: {
                read: true,
                write: false,
                download: false,
              },
            },
            {
              id: MENU_ID.EMSP_CORPORATE_PAYMENT_SETTLEMENT,
              parentId: MENU_ID.EMSP_CORPORATE_MEMBER,
              depth: 3,
              name: "법인 결제/정산",
              type: "menu",
              url: "/emsp/corporate-member/payment-settlement",
              checked: false,
              permissions: {
                read: true,
                write: false,
                download: false,
              },
            },
          ],
        },
      ],
    },
    {
      id: MENU_ID.PLATFORM_MANAGEMENT,
      parentId: null,
      depth: 1,
      name: "Platform Mgt.",
      type: "folder",
      expanded: false,
      checked: false,
      permissions: {
        read: false,
        write: false,
        download: false,
      },
      children: [],
    },
  ],
};

export const findMenuPermission = (
  menus: TMenuPermission[],
  menuId: TMenuId,
): TMenuPermission | null => {
  return (
    flattenTree(menus, (menu) => menu.children).find(
      (menu) => menu.id === menuId,
    ) ?? null
  );
};

// 단일 메뉴는 API가 내려준 permissions 값을 기준으로 허용 여부를 판단합니다.
export const hasMenuPermission = (
  menus: TMenuPermission[],
  menuId: TMenuId,
  permissionKey: TPermissionKey = "read",
) => {
  const menu = findMenuPermission(menus, menuId);

  if (!menu) {
    return false;
  }

  return menu.permissions[permissionKey];
};

// 폴더 메뉴는 자신 또는 하위 메뉴 중 하나라도 해당 권한이 있으면 그룹 접근 허용으로 봅니다.
// #TODO
export const hasChildrenMenuPermission = (
  menus: TMenuPermission[],
  menuId: TMenuId,
  permissionKey: TPermissionKey = "read",
) => {
  const menu = findMenuPermission(menus, menuId);

  if (!menu) {
    return false;
  }

  return flattenTree([menu], (item) => item.children).some(
    (item) => item.permissions[permissionKey],
  );
};
