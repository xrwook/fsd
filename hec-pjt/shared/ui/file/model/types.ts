import type { FileDetailItem } from "@/shared/api/file";

export type FileStatus = "idle" | "uploading" | "downloading" | "error";

export type FileItem = {
  id: string;
  name: string;
  size?: number;
  file?: File;
  downloadUrl?: string;
  type?: string;
  status?: FileStatus;
  error?: string;
  progress?: number;
};

export type FileUploadItem = FileItem & {
  fileDtlId?: string;
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
