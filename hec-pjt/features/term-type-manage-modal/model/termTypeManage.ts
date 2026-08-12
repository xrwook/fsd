export type TermTypeItem = {
  termCode: string;
  termName: string;
  sortOrder?: number;
};

export type TermTypeSaveItem = {
  termCode: string;
  termName: string;
};

export type TermTypeRow = {
  id: number | string;
  termCode: string;
  termName: string;
  isNew?: boolean;
  sortOrder?: number;
  termCodeError?: string;
  termCodeIsError?: boolean;
  termNameError?: string;
  termNameIsError?: boolean;
  readOnlyCode?: boolean;
};
