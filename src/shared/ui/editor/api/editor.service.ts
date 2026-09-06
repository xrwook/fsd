import axios from "axios";

import { createImageUploadUrl } from "@/shared/api/file";

import type { ImageUploadResult } from "../lib/tiptapImageUpload";

const getContentType = (file: File) => file.type || "application/octet-stream";

const uploadToSignedUrl = async (file: File, uploadUrl: string) => {
  try {
    await axios.put(uploadUrl, file, {
      headers: {
        "Content-Type": getContentType(file),
      },
      withCredentials: false,
    });
  } catch {
    throw new Error("이미지 파일 업로드에 실패했습니다.");
  }
};

export const uploadEditorImage = async (
  file: File,
  referenceType: string,
): Promise<ImageUploadResult> => {
  const normalizedReferenceType = referenceType.trim();
  if (!normalizedReferenceType) {
    throw new Error("이미지 업로드 referenceType이 필요합니다.");
  }

  const uploadUrlItem = await createImageUploadUrl({
    contentType: getContentType(file),
    fileSize: file.size,
    originalName: file.name,
    referenceType: normalizedReferenceType,
  });

  if (
    !uploadUrlItem.uploadUrl ||
    !uploadUrlItem.downloadUrl ||
    !uploadUrlItem.fileDtlId
  ) {
    throw new Error("이미지 업로드 URL 발급 응답이 올바르지 않습니다.");
  }

  await uploadToSignedUrl(file, uploadUrlItem.uploadUrl);

  return {
    fileDtlId: uploadUrlItem.fileDtlId,
    src: uploadUrlItem.downloadUrl,
  };
};
