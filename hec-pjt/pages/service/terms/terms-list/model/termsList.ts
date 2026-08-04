export type TermDeployStatus = "R" | "D" | "C";

export type TermTypeItem = {
  termCode: string;
  termName: string;
  sortOrder: number;
};

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

export type TermTypeRow = {
  id: number | string;
  termCode: string;
  termName: string;
  isNew?: boolean;
  sortOrder?: number;
  termCodeError?: string;
  termNameError?: string;
  readOnlyCode?: boolean;
};
