export const TERM_REQUIRED_OPTIONS = [
  { value: true, label: "필수" },
  { value: false, label: "선택" },
];

export const TERM_RECONSENT_OPTIONS = [
  { value: true, label: "적용" },
  { value: false, label: "미적용" },
];

export const TERM_DEPLOY_STATUS = [
  { value: "R", label: "예약" },
  { value: "D", label: "게시중" },
  { value: "C", label: "게시종료" },
];

export const TERM_FORM_DEPLOY_STATUS = [
  { value: "R", label: "예약 게시" },
  { value: "D", label: "즉시 게시" },
] as const;

export const TERM_REQUIRED_LABEL = {
  true: "필수",
  false: "선택",
} as const;

export const TERM_RECONSENT_LABEL = {
  true: "적용",
  false: "미적용",
} as const;

export const TERM_DEPLOY_STATUS_LABEL = {
  R: "예약",
  D: "게시중",
  C: "게시종료",
} as const;

export const BADGE_PROPS = {
  R: {
    semantic: "warning",
    styleOption: "fill-pastel",
    badgeContent: "예약",
  },
  D: {
    semantic: "success",
    styleOption: "fill-pastel",
    badgeContent: "게시중",
  },
  C: {
    semantic: "neutral",
    styleOption: "fill-pastel",
    badgeContent: "게시종료",
  },
} as const;
