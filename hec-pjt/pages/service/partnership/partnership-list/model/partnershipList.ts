export type PartnershipProcessStatusCd = "PENDING" | "CONFIRMED";

export type PartnershipListItem = {
  partnershipId: number;
  companyName: string;
  adminName: string;
  requestAt: string;
  confirmAdminName: string | null;
  confirmAt: string | null;
  processStatusCd: PartnershipProcessStatusCd;
  processStatusName: string;
};
