export type TermDeployStatus = "R" | "D" | "C";

export type TermVersionListItem = {
  id: string;
  termCode: string;
  ver: string;
  deployStatus: TermDeployStatus;
  deployStatusName: string;
  deployStartAt: string | null;
  deployEndAt?: string | null;
  isReserved?: boolean;
  reservedAt?: string | null;
  isRequired: boolean;
  isReconsentRequired?: boolean;
  content?: string;
  revisionReason: string;
  createdBy?: string;
  createdByName?: string;
  createdDate?: string;
  modifiedBy?: string;
  modifiedByName: string;
  modifiedDate: string;
};
