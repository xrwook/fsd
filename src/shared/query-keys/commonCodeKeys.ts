import type {
  CommonCodeDetailRequest,
  CommonCodeMultiRequest,
  CommonCodeRequest,
} from "@/shared/api/common-code/model";

export const commonCodeKeys = {
  all: ["common-code"] as const,
  detail: (params: CommonCodeDetailRequest) =>
    [...commonCodeKeys.all, "detail", params] as const,
  list: (params: CommonCodeRequest) =>
    [...commonCodeKeys.all, "list", params] as const,
  multi: (params: CommonCodeMultiRequest) =>
    [...commonCodeKeys.all, "multi", params] as const,
};
