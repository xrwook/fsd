import { apiRequest, type Response } from "@/shared/lib/api";

import type { ImageUploadResult } from "../lib/tiptapImageUpload";

const EDITOR_IMAGE_UPLOAD_URL =
  "http://localhost:3000/api/backend/test/file/testcase_001";

type EditorImageUploadResponse =
  | string
  | {
      url?: string;
      imageUrl?: string;
      fileUrl?: string;
      downloadUrl?: string;
      id?: string;
      location?: string;
      src?: string;
      path?: string;
      filePath?: string;
      data?: EditorImageUploadResponse;
      result?: EditorImageUploadResponse;
      file?: EditorImageUploadResponse;
      files?: EditorImageUploadResponse[];
    }
  | EditorImageUploadResponse[];

type EditorImageUploadRequest = {
  requestBody: FormData;
};

const pickString = (value: unknown): string | null => {
  return typeof value === "string" && value.trim().length > 0
    ? value.trim()
    : null;
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

const extractImageUploadResult = (response: unknown): ImageUploadResult | null => {
  if (!response) return null;

  if (typeof response === "string") {
    const src = pickString(response);
    return src ? { src } : null;
  }

  if (Array.isArray(response)) {
    for (const item of response) {
      const result = extractImageUploadResult(item);
      if (result) return result;
    }
    return null;
  }

  if (!isRecord(response)) return null;

  const src =
    pickString(response["url"]) ??
    pickString(response["imageUrl"]) ??
    pickString(response["fileUrl"]) ??
    pickString(response["downloadUrl"]) ??
    pickString(response["location"]) ??
    pickString(response["src"]) ??
    pickString(response["path"]) ??
    pickString(response["filePath"]);

  if (src) {
    return {
      src,
      imgId: pickString(response["id"]) ?? undefined,
    };
  }

  const nestedValues = [
    response["data"],
    response["result"],
    response["file"],
    response["files"],
  ];

  for (const nestedValue of nestedValues) {
    const nestedResult = extractImageUploadResult(nestedValue);
    if (nestedResult) return nestedResult;
  }

  return null;
};

export const uploadEditorImage = async (
  file: File,
): Promise<ImageUploadResult> => {
  const formData = new FormData();
  formData.append("files", file);

  const response = await apiRequest<
    Response<EditorImageUploadResponse>,
    EditorImageUploadRequest
  >("post", EDITOR_IMAGE_UPLOAD_URL, {
    requestBody: formData,
  });
  const imageUploadResult = extractImageUploadResult(response.data);

  if (!imageUploadResult) {
    throw new Error("이미지 업로드 응답에서 URL을 찾을 수 없습니다.");
  }

  return imageUploadResult;
};
