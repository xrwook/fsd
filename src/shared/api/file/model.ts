import type { Request, Response } from "@/shared/lib/api";


export type FileUploadUrlRequestItem = {
  referenceType: string;
  originalName: string;
  contentType: string;
  fileSize: number;
};

export type FileUploadUrlItem = {
  fileDtlId: string;
  uploadUrl: string;
  downloadUrl: string;
};

export type FileDetailItem = {
  fileDtlId: string;
  originalName: string;
  contentType: string;
  fileSize: number;
  downloadUrl: string;
};

export type FileGroupItem = {
  fileId: string;
  referenceType: string;
  files: FileDetailItem[];
};

export type MultipleFileUploadUrlsRequest = Request<{
  requestBody: FileUploadUrlRequestItem[];
}>;

export type ImageUploadUrlRequest = Request<{
  requestBody: FileUploadUrlRequestItem;
}>;

export type FileGroupsRequest = Request<{
  query: {
    fileId: number[];
  };
}>;

export type MultipleFileUploadUrlsResponse = Response<FileUploadUrlItem[]>;
export type ImageUploadUrlResponse = Response<FileUploadUrlItem>;
export type FileGroupsResponse = Response<FileGroupItem[]>;
export type FileGroupIdResponse = Response<string>;
