import { FileListItem, FileSelectorArea, FileTitle } from "@hae-fe/elements";

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

export const FileUpload = ({
  files,
  onFilesSelected,
  onDelete,
  onRetry,
  onDownload,
  disabled = false,
  isUploading = false,
  maxFileCount,
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
  const remainingFileCount =
    maxFileCount === undefined
      ? undefined
      : Math.max(maxFileCount - files.length, 0);
  const isMaxFileCountReached = remainingFileCount === 0;

  const handleFilesSelected = (selectedFiles: File[]) => {
    const uploadableFiles =
      remainingFileCount === undefined
        ? selectedFiles
        : selectedFiles.slice(0, remainingFileCount);

    if (uploadableFiles.length === 0) return;

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

    Promise.resolve(onRetry(getActionFileId(file))).catch(() => {});
  };

  const fileSizeBytes = files.reduce((acc, file) => acc + (file.size ?? 0), 0);

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
                onRetry && !disabled && file.status === "error" && file.file
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
          accept={accept}
          buttonText={buttonText}
          disabled={disabled || isUploading || isMaxFileCountReached}
          disableDragDrop={
            disableDragDrop || disabled || isUploading || isMaxFileCountReached
          }
          mainText={mainText}
          multiple={multiple}
          onFilesSelected={handleFilesSelected}
          subText={subText}
        />
      </div>
    </div>
  );
};
