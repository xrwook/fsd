export type ExcelUploadResult = {
  result: true;
  uploadExcel: File;
};

export type ExcelUploadSubmitResult =
  | { success: true }
  | { success: false; message: string };

export type ExcelUploadModalProps = {
  /** 화면별 업로드 양식 경로. public 파일은 /로 시작합니다. */
  templateUrl: string;
  templateFileName?: string;
  /** 각 화면에서 API를 호출하고 결과 문구를 반환합니다. */
  onSubmit: (file: File) => Promise<ExcelUploadSubmitResult>;
  title?: string;
  description?: string;
  templateButtonText?: string;
  confirmButtonText?: string;
  invalidFileMessage?: string;
  uploadErrorMessage?: string;
};
