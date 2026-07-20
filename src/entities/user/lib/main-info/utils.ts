import { SCREEN_ID, type ScreenIdValues } from "@/shared/config";
import { flattenTree } from "@/shared/lib/utils";

import type { TMenuPermission, TMenuPermissionField } from "./models";
import type { MainInfoData, MenuData } from "./types";

export const createMenuPermissions = (
  menus: MenuData[],
  parentId: MenuData["screenId"] | null = null,
  depth = 1,
): TMenuPermission[] => {
  return menus.map((menu) => {
    const children = createMenuPermissions(
      menu.children,
      menu.screenId,
      depth + 1,
    );

    return {
      menuId: menu.menuId,
      screenId: menu.screenId,
      parentId,
      depth,
      name: menu.name,
      type: children.length > 0 || !menu.url ? "folder" : "menu",
      url: menu.url || null,
      expanded: children.length > 0,
      canRead: menu.canRead,
      canCreate: menu.canCreate,
      canUpdate: menu.canUpdate,
      canDelete: menu.canDelete,
      canDownload: menu.canDownload,
      children,
    };
  });
};

const menuTreeMock: MenuData[] = [
  {
    menuId: 1,
    screenId: SCREEN_ID.DASHBOARD,
    parentId: null,
    name: "Dashboard",
    url: "/",
    sortOrder: 1,
    isLink: true,
    canRead: true,
    canCreate: true,
    canUpdate: true,
    canDelete: true,
    canDownload: true,
    children: [],
  },
  {
    menuId: 2,
    screenId: SCREEN_ID.CPOS.CPOS,
    parentId: null,
    name: "CPOS",
    url: "",
    sortOrder: 2,
    isLink: false,
    canRead: true,
    canCreate: true,
    canUpdate: true,
    canDelete: true,
    canDownload: true,
    children: [
      {
        menuId: 3,
        screenId: SCREEN_ID.CPOS.STATION_ROOT,
        parentId: 2,
        name: "충전소 관리",
        url: "",
        sortOrder: 1,
        isLink: false,
        canRead: true,
        canCreate: true,
        canUpdate: true,
        canDelete: true,
        canDownload: true,
        children: [
          {
            menuId: 4,
            screenId: SCREEN_ID.CPOS.STATION_MANAGEMENT,
            parentId: 3,
            name: "충전소 관리",
            url: "",
            sortOrder: 1,
            isLink: true,
            canRead: true,
            canCreate: false,
            canUpdate: false,
            canDelete: false,
            canDownload: true,
            children: [],
          },
          {
            menuId: 5,
            screenId: SCREEN_ID.CPOS.STATION_FEE_MANAGEMENT,
            parentId: 3,
            name: "충전소 요금 관리",
            url: "",
            sortOrder: 2,
            isLink: true,
            canRead: false,
            canCreate: false,
            canUpdate: false,
            canDelete: false,
            canDownload: false,
            children: [],
          },
          {
            menuId: 6,
            screenId: SCREEN_ID.CPOS.POWER_BANK_MANAGEMENT,
            parentId: 3,
            name: "파워 뱅크 관리",
            url: "",
            sortOrder: 3,
            isLink: true,
            canRead: true,
            canCreate: true,
            canUpdate: true,
            canDelete: true,
            canDownload: true,
            children: [],
          },
        ],
      },
      {
        menuId: 7,
        screenId: SCREEN_ID.CPOS.CHARGER_ROOT,
        parentId: 2,
        name: "충전기 관리",
        url: "",
        sortOrder: 2,
        isLink: false,
        canRead: true,
        canCreate: true,
        canUpdate: true,
        canDelete: true,
        canDownload: true,
        children: [
          {
            menuId: 8,
            screenId: SCREEN_ID.CPOS.M2M_MODEM_MANAGEMENT,
            parentId: 7,
            name: "M2M모뎀 관리",
            url: "",
            sortOrder: 1,
            isLink: true,
            canRead: false,
            canCreate: false,
            canUpdate: false,
            canDelete: false,
            canDownload: false,
            children: [],
          },
          {
            menuId: 9,
            screenId: SCREEN_ID.CPOS.CHARGER_STATUS,
            parentId: 7,
            name: "충전기 상태",
            url: "/cpos/charger-status",
            sortOrder: 2,
            isLink: true,
            canRead: false,
            canCreate: false,
            canUpdate: false,
            canDelete: false,
            canDownload: false,
            children: [],
          },
          {
            menuId: 10,
            screenId: SCREEN_ID.CPOS.CHARGER_CONTROL,
            parentId: 7,
            name: "충전기 제어",
            url: "",
            sortOrder: 3,
            isLink: true,
            canRead: false,
            canCreate: false,
            canUpdate: false,
            canDelete: false,
            canDownload: false,
            children: [],
          },
          {
            menuId: 11,
            screenId: SCREEN_ID.CPOS.CHARGER_ERROR_MANAGEMENT,
            parentId: 7,
            name: "충전기 고장 관리",
            url: "",
            sortOrder: 4,
            isLink: true,
            canRead: true,
            canCreate: true,
            canUpdate: true,
            canDelete: true,
            canDownload: true,
            children: [],
          },
        ],
      },
    ],
  },
  {
    menuId: 12,
    screenId: SCREEN_ID.CPOS.CLEARING_HOUSE,
    parentId: null,
    name: "Clearing House",
    url: "",
    sortOrder: 3,
    isLink: false,
    canRead: false,
    canCreate: false,
    canUpdate: false,
    canDelete: false,
    canDownload: false,
    children: [],
  },
  {
    menuId: 13,
    screenId: SCREEN_ID.EMSP.EMSP,
    parentId: null,
    name: "eMSP",
    url: "",
    sortOrder: 4,
    isLink: false,
    canRead: false,
    canCreate: false,
    canUpdate: false,
    canDelete: false,
    canDownload: false,
    children: [
      {
        menuId: 14,
        screenId: SCREEN_ID.EMSP.MEMBER_MANAGEMENT,
        parentId: 13,
        name: "회원관리",
        url: "",
        sortOrder: 1,
        isLink: false,
        canRead: false,
        canCreate: false,
        canUpdate: false,
        canDelete: false,
        canDownload: false,
        children: [
          {
            menuId: 15,
            screenId: SCREEN_ID.EMSP.MEMBER_INFO,
            parentId: 14,
            name: "회원정보",
            url: "/emsp/member-management/members",
            sortOrder: 1,
            isLink: true,
            canRead: true,
            canCreate: false,
            canUpdate: false,
            canDelete: false,
            canDownload: false,
            children: [],
          },
          {
            menuId: 16,
            screenId: SCREEN_ID.EMSP.MEMBER_PAYMENT,
            parentId: 14,
            name: "결제",
            url: "/emsp/member-management/member-payment",
            sortOrder: 2,
            isLink: true,
            canRead: false,
            canCreate: false,
            canUpdate: false,
            canDelete: false,
            canDownload: false,
            children: [],
          },
        ],
      },
      {
        menuId: 17,
        screenId: SCREEN_ID.EMSP.CORPORATE_MEMBER,
        parentId: 13,
        name: "법인회원",
        url: "",
        sortOrder: 2,
        isLink: false,
        canRead: true,
        canCreate: false,
        canUpdate: false,
        canDelete: false,
        canDownload: false,
        children: [
          {
            menuId: 18,
            screenId: SCREEN_ID.EMSP.CORPORATE_JOIN_MANAGEMENT,
            parentId: 17,
            name: "가입관리",
            url: "/emsp/corporate-member/corporate-join",
            sortOrder: 1,
            isLink: true,
            canRead: true,
            canCreate: false,
            canUpdate: false,
            canDelete: false,
            canDownload: false,
            children: [],
          },
          {
            menuId: 19,
            screenId: SCREEN_ID.EMSP.CORPORATE_PAYMENT_SETTLEMENT,
            parentId: 17,
            name: "법인 결제/정산",
            url: "/emsp/corporate-member/payment-settlement",
            sortOrder: 2,
            isLink: true,
            canRead: true,
            canCreate: false,
            canUpdate: false,
            canDelete: false,
            canDownload: false,
            children: [],
          },
        ],
      },
    ],
  },
  {
    menuId: 20,
    screenId: SCREEN_ID.PLATFORM_MANAGEMENT,
    parentId: null,
    name: "Platform Mgt.",
    url: "",
    sortOrder: 5,
    isLink: false,
    canRead: false,
    canCreate: false,
    canUpdate: false,
    canDelete: false,
    canDownload: false,
    children: [],
  },
];

// 실제 API 응답의 data shape를 맞춘 main info mock 데이터입니다.
export const mainInfoMock: MainInfoData = {
  userInfo: {
    adminId: "system",
    email: "system@system.com",
    adminName: "시스템",
    departmentName: "마스터 개발",
    userStatus: "U",
    accountType: "M",
  },
  partnerInfo: {
    partnerId: "HEC",
    partnerName: "현대 엔지니어링",
    partnerTypeCd: "HE",
  },
  termAgreements: [],
  menus: menuTreeMock,
};

export const findMenuPermission = (
  menus: TMenuPermission[],
  screenId: ScreenIdValues,
): TMenuPermission | null => {
  return (
    flattenTree(menus, (menu) => menu.children).find(
      (menu) => menu.screenId === screenId,
    ) ?? null
  );
};

// 단일 메뉴는 API가 내려준 canRead/canCreate/... 값을 기준으로 허용 여부를 판단합니다.
export const hasMenuPermission = (
  menus: TMenuPermission[],
  screenId: ScreenIdValues,
  permissionField: TMenuPermissionField = "canRead",
) => {
  const menu = findMenuPermission(menus, screenId);

  if (!menu) {
    return false;
  }

  return menu[permissionField];
};

// 폴더 메뉴는 자신 또는 하위 메뉴 중 하나라도 해당 권한이 있으면 그룹 접근 허용으로 봅니다.
// #TODO
export const hasChildrenMenuPermission = (
  menus: TMenuPermission[],
  screenId: ScreenIdValues,
  permissionField: TMenuPermissionField = "canRead",
) => {
  const menu = findMenuPermission(menus, screenId);

  if (!menu) {
    return false;
  }

  return flattenTree([menu], (item) => item.children).some(
    (item) => item[permissionField],
  );
};
