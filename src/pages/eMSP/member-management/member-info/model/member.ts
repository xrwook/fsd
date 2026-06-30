export type TMemberStatus = "이용 중" | "휴면";

export type TMemberSummary = {
  id: string;
  name: string;
  status: TMemberStatus;
};

export type TMemberListSearchParams = {
  keyword: string;
};
