import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import {
  type FileUploadUrlItem,
  type FileUploadUrlRequestItem,
  useFileGroupIdMutation,
  useUploadUrlsMutation,
} from "@/shared/api/file";

import type {
  FileConfirm,
  FileConfirmGroup,
  FileUploadInitialFile,
  FileUploadItem,
} from "./types";

export type UseFileUploadOptions = {
  referenceType: string;
  initialFileGroupId?: string;
  initialFiles?: FileUploadInitialFile[];
  autoCreateGroupId?: boolean;
};

const createLocalFileId = () => crypto.randomUUID();

const toFileArray = (files: File[] | FileList) => [...files];

const toUploadUrlRequestItem = (
  referenceType: string,
  file: File,
): FileUploadUrlRequestItem => ({
  referenceType,
  originalName: file.name,
  contentType: file.type,
  fileSize: file.size,
});

const toInitialFileUploadItem = (
  file: FileUploadInitialFile,
): FileUploadItem => ({
  id: file.id ?? file.fileDtlId,
  fileDtlId: file.fileDtlId,
  name: file.originalName,
  size: file.fileSize,
  downloadUrl: file.downloadUrl,
  status: "idle",
});

const toPendingFileUploadItem = (file: File): FileUploadItem => ({
  id: createLocalFileId(),
  name: file.name,
  size: file.size,
  status: "uploading",
  progress: 0,
});

const toUploadedFileUploadItem = (
  pendingFile: FileUploadItem,
  uploadUrlItem: FileUploadUrlItem,
): FileUploadItem => ({
  ...pendingFile,
  fileDtlId: uploadUrlItem.fileDtlId,
  downloadUrl: uploadUrlItem.downloadUrl,
  status: "idle",
  error: undefined,
  progress: undefined,
});

const uploadToSignedUrl = async (file: File, uploadUrl: string) => {
  const headers = file.type ? { "Content-Type": file.type } : undefined;
  const response = await fetch(uploadUrl, {
    method: "PUT",
    body: file,
    headers,
  });

  if (!response.ok) {
    throw new Error(`파일 업로드에 실패했습니다. (${response.status})`);
  }
};

export const useFileUpload = ({
  referenceType,
  initialFileGroupId,
  initialFiles = [],
  autoCreateGroupId = true,
}: UseFileUploadOptions) => {
  const [fileGroupId, setFileGroupId] = useState(initialFileGroupId);
  const [files, setFiles] = useState<FileUploadItem[]>(() =>
    initialFiles.map((file) => toInitialFileUploadItem(file)),
  );
  const [uploadError, setUploadError] = useState<Error | null>(null);
  const fileGroupIdPromiseReference = useRef<Promise<string> | null>(null);

  const { isPending: isCreatingFileGroupId, mutateAsync: createFileGroupId } =
    useFileGroupIdMutation();
  const { isPending: isCreatingUploadUrls, mutateAsync: createUploadUrls } =
    useUploadUrlsMutation();

  const updateFile = useCallback(
    (fileId: string, updater: (file: FileUploadItem) => FileUploadItem) => {
      setFiles((currentFiles) =>
        currentFiles.map((file) => (file.id === fileId ? updater(file) : file)),
      );
    },
    [],
  );

  const markFileAsError = useCallback(
    (fileId: string, error: unknown) => {
      const errorMessage =
        error instanceof Error ? error.message : "파일 업로드에 실패했습니다.";

      updateFile(fileId, (file) => ({
        ...file,
        status: "error",
        progress: 0,
        error: errorMessage,
      }));
    },
    [updateFile],
  );

  const ensureFileGroupId = useCallback(async () => {
    if (fileGroupId) return fileGroupId;

    if (fileGroupIdPromiseReference.current) {
      return fileGroupIdPromiseReference.current;
    }

    const fileGroupIdPromise = createFileGroupId();
    fileGroupIdPromiseReference.current = fileGroupIdPromise;

    try {
      const createdFileGroupId = await fileGroupIdPromise;
      setFileGroupId(createdFileGroupId);
      return createdFileGroupId;
    } finally {
      fileGroupIdPromiseReference.current = null;
    }
  }, [createFileGroupId, fileGroupId]);

  useEffect(() => {
    if (!autoCreateGroupId || fileGroupId) return;

    ensureFileGroupId().catch((error: unknown) => {
      setUploadError(
        error instanceof Error
          ? error
          : new Error("파일 그룹 ID 발급에 실패했습니다."),
      );
    });
  }, [autoCreateGroupId, ensureFileGroupId, fileGroupId]);

  const uploadPendingFile = useCallback(
    async (
      pendingFile: FileUploadItem,
      selectedFile: File,
      uploadUrlItem: FileUploadUrlItem,
    ) => {
      await uploadToSignedUrl(selectedFile, uploadUrlItem.uploadUrl);

      const uploadedFile = toUploadedFileUploadItem(pendingFile, uploadUrlItem);
      updateFile(pendingFile.id, () => uploadedFile);

      return uploadedFile;
    },
    [updateFile],
  );

  const uploadFiles = useCallback(
    async (selectedFiles: File[] | FileList) => {
      const fileArray = toFileArray(selectedFiles);

      if (fileArray.length === 0) {
        return [];
      }

      setUploadError(null);
      const pendingFiles = fileArray.map((file) =>
        toPendingFileUploadItem(file),
      );
      setFiles((currentFiles) => [...currentFiles, ...pendingFiles]);

      try {
        await ensureFileGroupId();
      } catch (error: unknown) {
        const normalizedError =
          error instanceof Error
            ? error
            : new Error("파일 그룹 ID 발급에 실패했습니다.");

        setUploadError(normalizedError);

        for (const pendingFile of pendingFiles) {
          markFileAsError(pendingFile.id, normalizedError);
        }

        throw normalizedError;
      }

      let uploadUrlItems: FileUploadUrlItem[];

      try {
        uploadUrlItems = await createUploadUrls(
          fileArray.map((file) => toUploadUrlRequestItem(referenceType, file)),
        );
      } catch (error: unknown) {
        const normalizedError =
          error instanceof Error
            ? error
            : new Error("업로드 URL 발급에 실패했습니다.");

        setUploadError(normalizedError);

        for (const pendingFile of pendingFiles) {
          markFileAsError(pendingFile.id, normalizedError);
        }

        throw normalizedError;
      }

      const uploadResults = await Promise.allSettled(
        pendingFiles.map((pendingFile, index) => {
          const uploadUrlItem = uploadUrlItems[index];

          if (!uploadUrlItem) {
            return Promise.reject(
              new Error("업로드 URL 응답이 파일 개수와 일치하지 않습니다."),
            );
          }

          return uploadPendingFile(
            pendingFile,
            fileArray[index],
            uploadUrlItem,
          );
        }),
      );

      const uploadedFiles = uploadResults.flatMap((result) =>
        result.status === "fulfilled" ? [result.value] : [],
      );
      const failedResults = uploadResults.filter(
        (result) => result.status === "rejected",
      );

      for (const [index, result] of uploadResults.entries()) {
        if (result.status === "rejected") {
          markFileAsError(pendingFiles[index].id, result.reason);
        }
      }

      if (failedResults.length > 0) {
        const error = new Error("일부 파일 업로드에 실패했습니다.");
        setUploadError(error);
        throw error;
      }

      return uploadedFiles;
    },
    [
      createUploadUrls,
      ensureFileGroupId,
      markFileAsError,
      referenceType,
      uploadPendingFile,
    ],
  );

  const removeFile = useCallback((fileId: string) => {
    setFiles((currentFiles) =>
      currentFiles.filter(
        (file) => file.id !== fileId && file.fileDtlId !== fileId,
      ),
    );
  }, []);

  const initializeFiles = useCallback(
    (nextFiles: FileUploadInitialFile[], nextFileGroupId?: string) => {
      if (nextFileGroupId) {
        setFileGroupId(nextFileGroupId);
      }

      setFiles(nextFiles.map((file) => toInitialFileUploadItem(file)));
      setUploadError(null);
    },
    [],
  );

  const resetFiles = useCallback(() => {
    setFiles([]);
    setUploadError(null);
  }, []);

  const uploadedFiles = useMemo(
    () =>
      files.filter(
        (file): file is FileUploadItem & { fileDtlId: string } =>
          file.status === "idle" && !!file.fileDtlId,
      ),
    [files],
  );

  const fileDtlIds = useMemo(
    () => uploadedFiles.map((file) => file.fileDtlId),
    [uploadedFiles],
  );

  const getFileConfirmGroup =
    useCallback(async (): Promise<FileConfirmGroup> => {
      const confirmedFileGroupId = await ensureFileGroupId();

      return {
        fileId: confirmedFileGroupId,
        referenceType,
        fileDtlIds,
      };
    }, [ensureFileGroupId, fileDtlIds, referenceType]);

  const getFileConfirm = useCallback(async (): Promise<FileConfirm> => {
    return {
      groups: [await getFileConfirmGroup()],
    };
  }, [getFileConfirmGroup]);

  return {
    fileGroupId,
    files,
    uploadedFiles,
    fileDtlIds,
    uploadError,
    isCreatingFileGroupId,
    isCreatingUploadUrls,
    isUploading: files.some((file) => file.status === "uploading"),
    ensureFileGroupId,
    uploadFiles,
    removeFile,
    initializeFiles,
    resetFiles,
    getFileConfirmGroup,
    getFileConfirm,
  };
};

export type UseFileUploadReturn = ReturnType<typeof useFileUpload>;
