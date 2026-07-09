export const DEFAULT_API_ERROR_MESSAGE = "요청 처리 중 오류가 발생했습니다.";
export const NETWORK_ERROR_MESSAGE = "서버와 통신할 수 없습니다.";

const API_ERROR_MESSAGES: Record<string, string> = {
  "9722.2010": "그룹코드 데이터를 찾을 수 없습니다.",
  "9722.2020": "그룹코드 상세 데이터를 찾을 수 없습니다.",
  "9722.4010": "이미 등록된 그룹코드입니다.",
  "9722.4020": "그룹코드를 찾을 수 없습니다.",
  "9722.4030": "이미 등록된 상세코드입니다.",
  "9722.5010": "수정할 그룹코드를 찾을 수 없습니다.",
  "9722.5020": "수정할 상세코드를 찾을 수 없습니다.",
  "9722.5030": "사용 중인 상세코드는 미사용으로 전환할 수 없습니다.",
  "9722.5040": "순서를 변경할 그룹코드를 찾을 수 없습니다.",
  "9722.5050": "순서를 변경할 상세코드를 찾을 수 없습니다.",
  "9722.7010": "삭제할 그룹코드를 찾을 수 없습니다.",
  "9722.7020": "사용 중인 그룹코드는 삭제할 수 없습니다.",
  "9722.7030": "삭제할 상세코드를 찾을 수 없습니다.",
};

export const normalizeApiErrorCode = (code: string | undefined) => {
  const trimmedCode = code?.trim();

  if (!trimmedCode) {
    return;
  }

  return trimmedCode.replace(/^E/i, "").replaceAll("_", ".");
};

export const getApiErrorMessage = (code: string | undefined) => {
  const normalizedCode = normalizeApiErrorCode(code);

  if (!normalizedCode) {
    return DEFAULT_API_ERROR_MESSAGE;
  }

  return API_ERROR_MESSAGES[normalizedCode] ?? DEFAULT_API_ERROR_MESSAGE;
};
