import type { FileDetailItem } from "@/shared/api/file";

export type FileUploadStatus = "idle" | "uploading" | "success" | "error";

export type FileUploadItem = {
  id: string;
  fileDtlId?: string;
  name: string;
  type: string;
  size: number;
  downloadUrl?: string;
  status: FileUploadStatus;
  progress?: number;
  errorMessage?: string;
  sourceFile?: File;
};

export type FileUploadInitialFile = FileDetailItem & {
  id?: string;
};

export type FileConfirmGroup = {
  fileId: string;
  referenceType: string;
  fileDtlIds: string[];
};

export type FileConfirm = {
  groups: FileConfirmGroup[];
};
