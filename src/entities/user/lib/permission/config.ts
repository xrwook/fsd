import type {
  TMenuPermission,
  TPermissionKey,
} from "@/entities/user/lib/permission/types";

// 실제 API가 내려주는 메뉴 트리 형태를 유지한 권한 mock 데이터입니다.
export const permissionMenuMock: TMenuPermission[] = [
  {
    id: "dashboard",
    parentId: null,
    depth: 1,
    name: "Dashboard",
    type: "folder",
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
    id: "cpos",
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
        id: "station-root",
        parentId: "cpos",
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
            id: "station-management",
            parentId: "station-root",
            depth: 3,
            name: "충전소 관리",
            type: "menu",
            checked: true,
            permissions: {
              read: true,
              write: true,
              download: true,
            },
          },
          {
            id: "station-fee-management",
            parentId: "station-root",
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
            id: "power-bank-management",
            parentId: "station-root",
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
        id: "charger-root",
        parentId: "cpos",
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
            id: "m2m-modem-management",
            parentId: "charger-root",
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
            id: "charger-status",
            parentId: "charger-root",
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
            id: "charger-control",
            parentId: "charger-root",
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
            id: "charger-error-management",
            parentId: "charger-root",
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
    id: "clearing-house",
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
    id: "emsp",
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
        id: "emsp-member-management",
        parentId: "emsp",
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
            id: "emsp-member-info",
            parentId: "emsp-member-management",
            depth: 3,
            name: "회원정보",
            type: "menu",
            checked: false,
            permissions: {
              read: false,
              write: false,
              download: false,
            },
          },
          {
            id: "emsp-member-payment",
            parentId: "emsp-member-management",
            depth: 3,
            name: "결제",
            type: "menu",
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
        id: "emsp-corporate-member",
        parentId: "emsp",
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
            id: "emsp-corporate-join-management",
            parentId: "emsp-corporate-member",
            depth: 3,
            name: "가입관리",
            type: "menu",
            checked: false,
            permissions: {
              read: true,
              write: false,
              download: false,
            },
          },
          {
            id: "emsp-corporate-payment-settlement",
            parentId: "emsp-corporate-member",
            depth: 3,
            name: "법인 결제/정산",
            type: "menu",
            checked: false,
            permissions: {
              read: false,
              write: false,
              download: false,
            },
          },
        ],
      },
    ],
  },
  {
    id: "platform-management",
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
];

// 권한 체크는 menu id 기준으로 하므로 중첩 메뉴를 평탄화해서 탐색합니다.
export const flatMenuPermissions = (
  menus: TMenuPermission[],
): TMenuPermission[] => {
  return menus.flatMap((menu) => [
    menu,
    ...flatMenuPermissions(menu.children ?? []),
  ]);
};

export const findMenuPermission = (
  menus: TMenuPermission[],
  menuId: string,
): TMenuPermission | null => {
  return (
    flatMenuPermissions(menus).find((menu) => menu.id === menuId) ?? null
  );
};

// 단일 메뉴는 API가 내려준 permissions 값을 기준으로 허용 여부를 판단합니다.
export const hasMenuPermission = (
  menus: TMenuPermission[],
  menuId: string,
  permissionKey: TPermissionKey = "read",
) => {
  const menu = findMenuPermission(menus, menuId);

  if (!menu) {
    return false;
  }

  return menu.permissions[permissionKey];
};

// 폴더 메뉴는 자신 또는 하위 메뉴 중 하나라도 해당 권한이 있으면 그룹 접근 허용으로 봅니다.
export const hasDescendantMenuPermission = (
  menus: TMenuPermission[],
  menuId: string,
  permissionKey: TPermissionKey = "read",
) => {
  const menu = findMenuPermission(menus, menuId);

  if (!menu) {
    return false;
  }

  return flatMenuPermissions([menu]).some(
    (item) => item.permissions[permissionKey],
  );
};
