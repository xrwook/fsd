import {
  Alert,
  Button,
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
} from "@hae-fe/elements";
import {
  type FileItem,
  FileListItem,
  FileSelectorArea,
  FileTitle,
} from "@hae-fe/pattern";
import { useState } from "react";

import { useModal } from "@/shared/lib/modal";

import type { ExcelUploadModalProps, ExcelUploadResult } from "./model";

const XLSX_EXTENSION = ".xlsx";

const getErrorMessage = (error: unknown, fallbackMessage: string) =>
  error instanceof Error && error.message ? error.message : fallbackMessage;

const downloadTemplate = (templateUrl: string, templateFileName?: string) => {
  const anchor = document.createElement("a");
  anchor.href = templateUrl;
  anchor.download = templateFileName ?? "";
  document.body.append(anchor);
  anchor.click();
  anchor.remove();
};

export const ExcelUploadErrorModal = ({ message }: { message: string }) => {
  const { close } = useModal();

  return (
    <Dialog open onClose={() => close({ result: false })}>
      <DialogHeader
        hdsProps={{
          showCloseIcon: false,
          onClose: () => close({ result: false }),
        }}
      >
        업로드 오류
      </DialogHeader>
      <DialogContent>
        <Alert hdsProps={{ type: "error" }}>
          <div className="whitespace-pre-line">{message}</div>
        </Alert>
      </DialogContent>
      <DialogFooter
        hdsProps={{
          positiveButton: {
            children: "확인",
            onClick: () => close({ result: false }),
          },
        }}
      />
    </Dialog>
  );
};

export const ExcelUploadModal = ({
  templateUrl,
  templateFileName,
  onSubmit,
  title = "파일 업로드",
  description = "지정된 양식에 맞춰 작성한 파일만 업로드할 수 있습니다.",
  templateButtonText = "업로드 양식 다운로드",
  confirmButtonText = "등록하기",
  invalidFileMessage = "xlsx 파일만 첨부할 수 있습니다.",
  uploadErrorMessage = "파일 업로드에 실패했습니다.",
}: ExcelUploadModalProps) => {
  const { close, open } = useModal();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [files, setFiles] = useState<FileItem[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  const handleFilesSelected = (newFiles: File[]) => {
    const file = newFiles[0];

    if (!file) return;

    setSelectedFile(file);
    setFiles([
      {
        id: crypto.randomUUID(),
        name: file.name,
        size: file.size,
        status: "idle",
      },
    ]);
  };

  const handleDeleteFile = () => {
    setSelectedFile(null);
    setFiles([]);
  };

  const handleConfirm = async () => {
    if (!selectedFile || isUploading) return;

    if (!selectedFile.name.toLowerCase().endsWith(XLSX_EXTENSION)) {
      await open(ExcelUploadErrorModal, { message: invalidFileMessage });
      return;
    }

    setIsUploading(true);

    try {
      const submitResult = await onSubmit(selectedFile);

      if (!submitResult.success) {
        await open(ExcelUploadErrorModal, { message: submitResult.message });
        return;
      }

      close({
        result: true,
        uploadExcel: selectedFile,
      } satisfies ExcelUploadResult);
    } catch (error: unknown) {
      await open(ExcelUploadErrorModal, {
        message: getErrorMessage(error, uploadErrorMessage),
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleCancel = () => {
    if (!isUploading) close({ result: false });
  };

  return (
    <Dialog open onClose={handleCancel}>
      <DialogHeader hdsProps={{ showCloseIcon: true, onClose: handleCancel }}>
        {title}
      </DialogHeader>
      <DialogContent>
        <Alert hdsProps={{ type: "progress" }} className="mb-5">
          {description}
          <br />
          업로드 양식을 다운로드한 후 작성해 주세요.
          <br />
          .xlsx 파일 1개만 첨부할 수 있습니다.
        </Alert>

        <Button
          className="mb-5"
          size="small"
          styleOption="outline"
          semantic="neutral"
          onClick={() => downloadTemplate(templateUrl, templateFileName)}
        >
          {templateButtonText}
        </Button>

        <div className="flex flex-col gap-2">
          <FileTitle
            variant="upload"
            fileCount={files.length}
            fileSizeBytes={files.reduce(
              (total, file) => total + (file.size ?? 0),
              0,
            )}
          />

          <div>
            <div
              className={`overflow-hidden ${
                files.length > 0
                  ? "border border-b-0 border-(--color-light-action-border-neutral-weaker) py-2"
                  : ""
              }`}
            >
              {files.map((file) => (
                <FileListItem
                  key={file.id}
                  fileItem={file}
                  layout="list"
                  onDelete={handleDeleteFile}
                />
              ))}
            </div>

            <FileSelectorArea
              multiple={false}
              accept={XLSX_EXTENSION}
              subText="xlsx 파일 1개"
              onFilesSelected={handleFilesSelected}
              disabled={isUploading}
            />
          </div>
        </div>
      </DialogContent>
      <DialogFooter
        hdsProps={{
          negativeButton: {
            children: "취소",
            onClick: handleCancel,
            disabled: isUploading,
          },
          positiveButton: {
            children: confirmButtonText,
            onClick: handleConfirm,
            disabled: !selectedFile || isUploading,
          },
        }}
      />
    </Dialog>
  );
};
