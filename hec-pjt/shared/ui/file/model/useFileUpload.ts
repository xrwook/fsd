import axios from "axios";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import {
  type FileUploadUrlItem,
  type FileUploadUrlRequestItem,
  useFileGroupIdMutation,
  useUploadUrlsMutation,
} from "@/shared/api/file";

import { getUploadableFiles } from "./fileLimit";
import { toFileUploadItem } from "./fileMapper";
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
  maxFileCount?: number;
};

const createLocalFileId = () => crypto.randomUUID();

const toUploadUrlRequestItem = (
  referenceType: string,
  file: File,
): FileUploadUrlRequestItem => ({
  referenceType,
  originalName: file.name,
  contentType: file.type,
  fileSize: file.size,
});

const toPendingFileUploadItem = (file: File): FileUploadItem => ({
  id: createLocalFileId(),
  name: file.name,
  size: file.size,
  sourceFile: file,
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
  sourceFile: undefined,
  status: "idle",
  error: undefined,
  progress: undefined,
});

const uploadToSignedUrl = async (file: File, uploadUrl: string) => {
  const headers = file.type ? { "Content-Type": file.type } : undefined;

  try {
    await axios.put(uploadUrl, file, {
      headers,
      withCredentials: false,
    });
  } catch {
    throw new Error("파일 업로드에 실패했습니다.");
  }
};

export const useFileUpload = ({
  referenceType,
  initialFileGroupId,
  initialFiles = [],
  autoCreateGroupId = true,
  maxFileCount,
}: UseFileUploadOptions) => {
  const [fileGroupId, setFileGroupId] = useState(initialFileGroupId);
  const [files, setFiles] = useState<FileUploadItem[]>(() =>
    initialFiles.map((file) => toFileUploadItem(file)),
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

  const resolveFileGroupId = useCallback(async () => {
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

    resolveFileGroupId().catch((error: unknown) => {
      setUploadError(
        error instanceof Error
          ? error
          : new Error("파일 그룹 ID 발급에 실패했습니다."),
      );
    });
  }, [autoCreateGroupId, resolveFileGroupId, fileGroupId]);

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
      const fileArray = getUploadableFiles({
        currentFileCount: files.length,
        maxFileCount,
        selectedFiles,
      });

      if (fileArray.length === 0) {
        return [];
      }

      setUploadError(null);
      const pendingFiles = fileArray.map((file) =>
        toPendingFileUploadItem(file),
      );

      setFiles((currentFiles) =>
        maxFileCount === 1 ? pendingFiles : [...currentFiles, ...pendingFiles],
      );

      try {
        await resolveFileGroupId();
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
      resolveFileGroupId,
      files.length,
      markFileAsError,
      maxFileCount,
      referenceType,
      uploadPendingFile,
    ],
  );

  const retryFile = useCallback(
    async (fileId: string) => {
      const retryTargetFile = files.find(
        (file) => file.id === fileId || file.fileDtlId === fileId,
      );

      if (!retryTargetFile?.sourceFile) {
        return;
      }

      setUploadError(null);
      updateFile(retryTargetFile.id, (file) => ({
        ...file,
        fileDtlId: undefined,
        downloadUrl: undefined,
        status: "uploading",
        error: undefined,
        progress: 0,
      }));

      try {
        await resolveFileGroupId();
      } catch (error: unknown) {
        const normalizedError =
          error instanceof Error
            ? error
            : new Error("파일 그룹 ID 발급에 실패했습니다.");

        setUploadError(normalizedError);
        markFileAsError(retryTargetFile.id, normalizedError);
        throw normalizedError;
      }

      let uploadUrlItem: FileUploadUrlItem | undefined;

      try {
        [uploadUrlItem] = await createUploadUrls([
          toUploadUrlRequestItem(referenceType, retryTargetFile.sourceFile),
        ]);
      } catch (error: unknown) {
        const normalizedError =
          error instanceof Error
            ? error
            : new Error("업로드 URL 발급에 실패했습니다.");

        setUploadError(normalizedError);
        markFileAsError(retryTargetFile.id, normalizedError);
        throw normalizedError;
      }

      if (!uploadUrlItem) {
        const error = new Error(
          "업로드 URL 응답이 파일 개수와 일치하지 않습니다.",
        );
        setUploadError(error);
        markFileAsError(retryTargetFile.id, error);
        throw error;
      }

      try {
        return await uploadPendingFile(
          retryTargetFile,
          retryTargetFile.sourceFile,
          uploadUrlItem,
        );
      } catch (error: unknown) {
        const normalizedError =
          error instanceof Error
            ? error
            : new Error("파일 업로드에 실패했습니다.");

        setUploadError(normalizedError);
        markFileAsError(retryTargetFile.id, normalizedError);
        throw normalizedError;
      }
    },
    [
      createUploadUrls,
      resolveFileGroupId,
      files,
      markFileAsError,
      referenceType,
      updateFile,
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

      setFiles(nextFiles.map((file) => toFileUploadItem(file)));
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
      const confirmedFileGroupId = await resolveFileGroupId();

      return {
        fileId: confirmedFileGroupId,
        referenceType,
        fileDtlIds,
      };
    }, [resolveFileGroupId, fileDtlIds, referenceType]);

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
    resolveFileGroupId: resolveFileGroupId,
    uploadFiles,
    retryFile,
    removeFile,
    initializeFiles,
    resetFiles,
    getFileConfirmGroup,
    getFileConfirm,
  };
};

export type UseFileUploadReturn = ReturnType<typeof useFileUpload>;
