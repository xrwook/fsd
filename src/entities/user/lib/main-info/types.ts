import type { ScreenIdValues } from "@/shared/config";

export type MenuData = {
  menuId: number;
  screenId: ScreenIdValues | string;
  name: string;
  parentId: number | string | null;
  depth?: number;
  type?: "folder" | "menu";
  url: string;
  sortOrder?: number;
  isLink?: boolean;
  expanded?: boolean;
  canRead: boolean;
  canCreate: boolean;
  canUpdate: boolean;
  canDelete: boolean;
  canDownload: boolean;
  children: MenuData[];
};

export type UserInfo = {
  adminId: string;
  email: string;
  adminName: string;
  departmentName: string;
  userStatus: string;
  accountType: string;
};

export type PartnerInfo = {
  partnerId: string;
  partnerName: string;
  partnerTypeCd: string;
};

export type TermAgreement = {
  termType: string;
  termName: string;
  isReconsent: boolean;
};

/**
 * 사용자/파트너/약관/메뉴 조회 API의 data 타입입니다.
 */
export type MainInfoData = {
  userInfo: UserInfo;
  partnerInfo: PartnerInfo;
  termAgreements: TermAgreement[];
  menus: MenuData[];
};
