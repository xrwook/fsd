import { FileListItem, FileSelectorArea, FileTitle } from "@hae-fe/elements";
import { useState } from "react";

import type { FileUploadItem } from "../model";

export type FileUploadProps = {
  files: FileUploadItem[];
  onFilesSelected: (files: File[]) => void | Promise<unknown>;
  onDelete: (fileId: string) => void;
  onRetry?: (fileId: string) => void | Promise<unknown>;
  onDownload?: (file: FileUploadItem) => void;
  disabled?: boolean;
  isUploading?: boolean;
  maxFileCount?: number;
  maxFileSizeBytes?: number;
  allowedExtensions?: string[];
  multiple?: boolean;
  accept?: string;
  mainText?: string;
  subText?: string;
  buttonText?: string;
  disableDragDrop?: boolean;
  layout?: "list" | "box" | "inline";
  showFileIcon?: boolean;
  showTitle?: boolean;
  className?: string;
  fileListClassName?: string;
};

const getActionFileId = (file: FileUploadItem) => file.fileDtlId ?? file.id;

const openDownloadUrl = (downloadUrl: string) => {
  window.open(downloadUrl, "_blank", "noopener,noreferrer");
};

const DEFAULT_MAIN_TEXT = "여기로 파일을 드래그하세요";
const INVALID_UPLOAD_CONDITION_TEXT = "아래의 형식을 확인해 주세요";
const UPLOAD_ERROR_TEXT = "잠시 후 다시 시도해 주세요";
const MAX_FILE_COUNT_REACHED_TEXT = "기존 파일 삭제 후 업로드해 주세요";

const normalizeExtension = (extension: string) =>
  extension.trim().replace(/^\./, "").toLowerCase();

const getFileExtension = (fileName: string) => {
  const parts = fileName.split(".");

  if (parts.length < 2) return "";

  return parts.at(-1)?.toLowerCase() ?? "";
};

const toAccept = (allowedExtensions?: string[]) =>
  allowedExtensions
    ?.map((extension) => `.${normalizeExtension(extension)}`)
    .join(",");

const getInvalidExtensionFile = (
  files: File[],
  allowedExtensions?: string[],
) => {
  const normalizedExtensions = allowedExtensions
    ?.map((extension) => normalizeExtension(extension))
    .filter(Boolean);

  if (!normalizedExtensions?.length) return null;

  return (
    files.find(
      (file) => !normalizedExtensions.includes(getFileExtension(file.name)),
    ) ?? null
  );
};

const getUploadableFiles = (
  selectedFiles: File[] | FileList,
  remainingFileCount?: number,
) => {
  const fileArray = [...selectedFiles];

  return remainingFileCount === undefined
    ? fileArray
    : fileArray.slice(0, remainingFileCount);
};

const getInvalidFileSizeFile = (files: File[], maxFileSizeBytes?: number) => {
  if (maxFileSizeBytes === undefined) return null;

  return files.find((file) => file.size > maxFileSizeBytes) ?? null;
};

const resolveMainText = ({
  fallbackMainText,
  hasFileError,
  hasInvalidUploadCondition,
  isMaxFileCountReached,
}: {
  fallbackMainText?: string;
  hasFileError: boolean;
  hasInvalidUploadCondition: boolean;
  isMaxFileCountReached: boolean;
}) => {
  if (isMaxFileCountReached) return MAX_FILE_COUNT_REACHED_TEXT;
  if (hasInvalidUploadCondition) return INVALID_UPLOAD_CONDITION_TEXT;
  if (hasFileError) return UPLOAD_ERROR_TEXT;

  return fallbackMainText ?? DEFAULT_MAIN_TEXT;
};

export const FileUpload = ({
  files,
  onFilesSelected,
  onDelete,
  onRetry,
  onDownload,
  disabled = false,
  isUploading = false,
  maxFileCount,
  maxFileSizeBytes,
  allowedExtensions,
  multiple = true,
  accept,
  mainText,
  subText,
  buttonText,
  disableDragDrop = false,
  layout = "list",
  showFileIcon = true,
  showTitle = true,
  className = "flex flex-col gap-2",
  fileListClassName,
}: FileUploadProps) => {
  const [hasInvalidUploadCondition, setHasInvalidUploadCondition] =
    useState(false);
  const remainingFileCount =
    maxFileCount === undefined
      ? undefined
      : Math.max(maxFileCount - files.length, 0);
  const isMaxFileCountReached = remainingFileCount === 0;

  const handleFilesSelected = (selectedFiles: File[] | FileList) => {
    const uploadableFiles = getUploadableFiles(
      selectedFiles,
      remainingFileCount,
    );

    if (uploadableFiles.length === 0) return;

    setHasInvalidUploadCondition(false);

    const invalidFile = getInvalidExtensionFile(
      uploadableFiles,
      allowedExtensions,
    );

    if (invalidFile) {
      setHasInvalidUploadCondition(true);
      return;
    }

    const invalidFileSizeFile = getInvalidFileSizeFile(
      uploadableFiles,
      maxFileSizeBytes,
    );

    if (invalidFileSizeFile) {
      setHasInvalidUploadCondition(true);
      return;
    }

    Promise.resolve(onFilesSelected(uploadableFiles)).catch(() => {});
  };

  const handleDownload = (file: FileUploadItem) => {
    if (onDownload) {
      onDownload(file);
      return;
    }

    if (file.downloadUrl) {
      openDownloadUrl(file.downloadUrl);
    }
  };

  const handleRetry = (file: FileUploadItem) => {
    if (!onRetry || disabled) return;

    setHasInvalidUploadCondition(false);
    Promise.resolve(onRetry(getActionFileId(file))).catch(() => {});
  };

  const hasFileError = files.some((file) => file.status === "error");
  const fileSizeBytes = files.reduce((acc, file) => acc + (file.size ?? 0), 0);
  const selectorMainText = resolveMainText({
    fallbackMainText: mainText,
    hasFileError,
    hasInvalidUploadCondition,
    isMaxFileCountReached,
  });

  return (
    <div className={className}>
      {showTitle && (
        <FileTitle
          fileCount={files.length}
          fileSizeBytes={fileSizeBytes}
          variant="upload"
        />
      )}

      <div>
        <div
          className={
            fileListClassName ??
            `overflow-hidden ${
              files.length > 0
                ? "border border-b-0 border-(--color-light-action-border-neutral-weaker) py-2"
                : ""
            }`
          }
        >
          {files.map((file) => (
            <FileListItem
              key={file.id}
              deleteDisabled={disabled || file.status === "uploading"}
              downloadDisabled={!file.downloadUrl}
              fileItem={file}
              layout={layout}
              onDelete={() => {
                onDelete(getActionFileId(file));
              }}
              onDownload={() => {
                handleDownload(file);
              }}
              onRetry={
                onRetry &&
                !disabled &&
                file.status === "error" &&
                file.sourceFile
                  ? () => {
                      handleRetry(file);
                    }
                  : undefined
              }
              showFileIcon={showFileIcon}
              uploadProgress={file.progress}
            />
          ))}
        </div>

        <FileSelectorArea
          accept={accept ?? toAccept(allowedExtensions)}
          buttonText={buttonText}
          disabled={disabled || isUploading || isMaxFileCountReached}
          disableDragDrop={
            disableDragDrop || disabled || isUploading || isMaxFileCountReached
          }
          mainText={selectorMainText}
          multiple={multiple}
          onFilesSelected={handleFilesSelected}
          subText={subText}
        />
      </div>
    </div>
  );
};
