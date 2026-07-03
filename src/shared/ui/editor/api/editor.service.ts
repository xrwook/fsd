type EditorImageUploadResponse =
  | string
  | {
      url?: string;
      imageUrl?: string;
      fileUrl?: string;
      downloadUrl?: string;
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

const pickString = (value: unknown): string | null => {
  return typeof value === "string" && value.trim().length > 0
    ? value.trim()
    : null;
};

const extractImageUrl = (
  response: EditorImageUploadResponse | undefined,
): string | null => {
  if (!response) return null;

  if (typeof response === "string") {
    return pickString(response);
  }

  if (Array.isArray(response)) {
    for (const item of response) {
      const url = extractImageUrl(item);
      if (url) return url;
    }
    return null;
  }

  const url =
    pickString(response.url) ??
    pickString(response.imageUrl) ??
    pickString(response.fileUrl) ??
    pickString(response.downloadUrl) ??
    pickString(response.location) ??
    pickString(response.src) ??
    pickString(response.path) ??
    pickString(response.filePath);

  if (url) return url;

  const nestedValues = [
    response.data,
    response.result,
    response.file,
    response.files,
  ];

  for (const nestedValue of nestedValues) {
    const nestedUrl = extractImageUrl(nestedValue);
    if (nestedUrl) return nestedUrl;
  }

  return null;
};

export const uploadEditorImage = async (_file: File): Promise<string> => {
  // const formData = new FormData();
  // formData.append("files", file);

  // const response =
  //   await axiosInstance.post<EditorImageUploadResponse>(formData);
  // const imageUrl = extractImageUrl(response.data);

  // if (!imageUrl) {
  //   throw new Error("이미지 업로드 응답에서 URL을 찾을 수 없습니다.");
  // }

  return "";
};
