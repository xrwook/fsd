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
    <div className="tiptap-editor__status" aria-live="polite">
      {uploadCount > 0 && (
        <span className="tiptap-editor__uploading">
          <span className="tiptap-editor__spinner" aria-hidden="true" />
          이미지 업로드 중... ({uploadCount})
        </span>
      )}
      {error && <span className="tiptap-editor__error">{error}</span>}
    </div>
  );
};
