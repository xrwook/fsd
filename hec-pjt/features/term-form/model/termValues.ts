export type TermFormDeployStatus = "R" | "D";

export type TermFormValues = {
  termCode: string;
  ver: string;
  isRequired: boolean;
  isReconsentRequired: boolean;
  content: string;
  revisionReason: string;
  deployStatus: TermFormDeployStatus;
  reservedAt: Date | null;
};

export const DEFAULT_VALUES: TermFormValues = {
  termCode: "",
  ver: "",
  isRequired: true,
  isReconsentRequired: true,
  content: "",
  revisionReason: "",
  deployStatus: "D",
  reservedAt: null,
};
