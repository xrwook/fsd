import type { FileGroupItem } from "@/shared/api/file";

import type { FileItem, FileUploadInitialFile, FileUploadItem } from "./types";

export type FileUploadInitialState = {
  initialFileGroupId?: string;
  initialFiles: FileUploadInitialFile[];
};

const toFile = (file: FileUploadInitialFile): File =>
  new File([], file.originalName, { type: file.contentType });

export const toFileUploadItem = (
  file: FileUploadInitialFile,
): FileUploadItem => ({
  id: file.id ?? file.fileDtlId,
  fileDtlId: file.fileDtlId,
  name: file.originalName,
  size: file.fileSize,
  file: toFile(file),
  downloadUrl: file.downloadUrl,
  status: "idle",
});

export const toFileUploadItems = (
  files: readonly FileUploadInitialFile[] = [],
): FileUploadItem[] => files.map((file) => toFileUploadItem(file));

export const toFileUploadInitialState = (
  attachFiles: FileGroupItem[] | null | undefined,
  fileGroupId?: string,
): FileUploadInitialState => {
  const files = attachFiles?.flatMap((fileGroup) => fileGroup.files);

  return {
    initialFileGroupId: fileGroupId ?? attachFiles?.[0]?.fileId,
    initialFiles: files ?? [],
  };
};

export const toDetailFileItems = (
  attachFiles: FileGroupItem[] | null | undefined,
): FileItem[] => {
  const files = attachFiles?.flatMap((fileGroup) => fileGroup.files);

  return (files ?? []).map((file) => ({
    id: file.fileDtlId,
    name: file.originalName,
    size: file.fileSize,
    file: toFile(file),
    downloadUrl: file.downloadUrl,
    status: "idle",
  }));
};
