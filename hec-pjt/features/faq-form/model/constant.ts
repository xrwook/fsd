export const FAQ_PUBLISH_STATUS = [
  { value: "SCHEDULED", label: "예약 게시" },
  { value: "PUBLISHED", label: "게시" },
  { value: "UNPUBLISHED", label: "미게시" },
];

export const FAQ_BADGE_PROPS = {
  SCHEDULED: {
    semantic: "warning",
    styleOption: "fill-pastel",
    badgeContent: "예약",
  },
  PUBLISHED: {
    semantic: "success",
    styleOption: "fill-pastel",
    badgeContent: "게시",
  },
  UNPUBLISHED: {
    semantic: "neutral",
    styleOption: "fill-pastel",
    badgeContent: "미게시",
  },
} as const;
