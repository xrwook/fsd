export interface FaqFormValues {
  faqCategoryId: string;
  question: string;
  answer: string;
  publishType: string;
  scheduledAt: Date | null;
  isTop10: boolean;
  version?: number;
}

export const DEFAULT_VALUES: FaqFormValues = {
  faqCategoryId: "",
  question: "",
  answer: "",
  publishType: "",
  scheduledAt: null,
  isTop10: false,
};
