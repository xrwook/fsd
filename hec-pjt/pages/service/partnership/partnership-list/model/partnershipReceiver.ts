export type PartnershipReceiver = {
  partnershipReceiverId: number;
  adminId: string;
  adminName: string;
  email: string;
};

export type PartnershipRegistrableReceiver = {
  adminId: string;
  adminName: string;
  companyId: string;
  companyName: string;
  hpNum: string;
  email: string;
};
