export const MEMBER_TYPE = {
  MEMBER: "MEMBER",
  ROAMING: "ROAMING",
} as const;

export type MemberType = (typeof MEMBER_TYPE)[keyof typeof MEMBER_TYPE];

// TODO: 요금 API 연동 후 충전 속도와 회원 유형별 실제 가격으로 교체
export const getPrice = (_availCpKw: number, _memberType: MemberType): number =>
  280;
