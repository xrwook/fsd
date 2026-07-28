import type { FileGroupsRequest } from "@/shared/api/file/model";

export const fileKeys = {
  all: ["file"] as const,
  groupId: () => [...fileKeys.all, "group-id"] as const,
  groups: (params: FileGroupsRequest) => [...fileKeys.all, "groups", params] as const,
  imageUploadUrl: () => [...fileKeys.all, "image-upload-url"] as const,
  multipleUploadUrls: () => [...fileKeys.all, "multiple-upload-urls"] as const,
};
