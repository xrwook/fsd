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
  const handleFilesSelected = (selectedFiles: File[]) => {
    Promise.resolve(onFilesSelected(selectedFiles)).catch(() => {});
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

  const fileSizeBytes = files.reduce((acc, file) => acc + file.size, 0);

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
                onRetry
                  ? () => {
                      Promise.resolve(onRetry(getActionFileId(file))).catch(
                        () => {},
                      );
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
          disabled={disabled || isUploading}
          disableDragDrop={disableDragDrop || disabled || isUploading}
          mainText={mainText}
          multiple={multiple}
          onFilesSelected={handleFilesSelected}
          subText={subText}
        />
      </div>
    </div>
  );
};
