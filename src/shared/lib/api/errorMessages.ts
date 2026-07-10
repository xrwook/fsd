import { API_ERROR_MESSAGES, DEFAULT_API_ERROR_MESSAGE } from "./constants";

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
