type EditorUploadStatusProps = {
  error: string;
  uploadCount: number;
};

export const EditorUploadStatus = ({
  error,
  uploadCount,
}: EditorUploadStatusProps) => {
  if (uploadCount === 0 && !error) return null;

  return (
    <div className="tiptapEditorStatus" aria-live="polite">
      {uploadCount > 0 && (
        <span className="tiptapEditorUploading">
          <span className="tiptapEditorSpinner" aria-hidden="true" />
          이미지 업로드 중... ({uploadCount})
        </span>
      )}
      {error && <span className="tiptapEditorError">{error}</span>}
    </div>
  );
};
