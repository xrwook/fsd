import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import { type MouseEvent, useId, useState } from "react";

import type { EditorControlProps } from "../model/editorControl";
import { EditorIcon } from "./_EditorIcon";
import { ToolbarButton } from "./_ToolbarButton";

type Props = EditorControlProps;

export const HistoryControls = ({ disabled, editor }: Props) => {
  const previewTitleId = useId();
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [previewHtml, setPreviewHtml] = useState("");

  const clearFormatting = () => {
    editor
      .chain()
      .focus()
      .unsetAllMarks()
      .unsetFontFamily()
      .unsetFontSize()
      .unsetColor()
      .unsetHighlight()
      .clearNodes()
      .unsetTextAlign()
      .removeEmptyTextStyle()
      .run();
  };

  const openPreview = () => {
    setPreviewHtml(editor.isEmpty ? "" : editor.getHTML());
    setIsPreviewOpen(true);
  };

  const closePreview = () => {
    setIsPreviewOpen(false);
  };

  const handlePreviewClick = (event: MouseEvent<HTMLDivElement>) => {
    const target = event.target;
    if (!(target instanceof HTMLElement)) return;

    const button = target.closest<HTMLButtonElement>("button[data-href]");
    const href = button?.dataset.href;
    if (!href) return;

    window.open(href, "_blank", "noopener,noreferrer");
  };

  return (
    <>
      <div className="tiptapToolbarGroup">
        <ToolbarButton
          disabled={disabled || !editor.can().undo()}
          label="실행 취소"
          onClick={() => editor.chain().focus().undo().run()}
        >
          <EditorIcon name="undo" />
        </ToolbarButton>
        <ToolbarButton
          disabled={disabled || !editor.can().redo()}
          label="다시 실행"
          onClick={() => editor.chain().focus().redo().run()}
        >
          <EditorIcon name="redo" />
        </ToolbarButton>
        <ToolbarButton
          disabled={disabled}
          label="서식 지우기"
          onClick={clearFormatting}
        >
          <EditorIcon name="formatClear" />
        </ToolbarButton>
        <ToolbarButton
          disabled={disabled}
          label="미리 보기"
          onClick={openPreview}
        >
          <EditorIcon name="visibility" />
        </ToolbarButton>
      </div>

      <Dialog
        fullWidth
        aria-labelledby={previewTitleId}
        maxWidth="md"
        open={isPreviewOpen}
        slotProps={{
          paper: {
            className: "tiptapEditorPreviewPaper",
          },
        }}
        onClose={closePreview}
      >
        <DialogTitle id={previewTitleId} className="tiptapEditorPreviewTitle">
          미리 보기
        </DialogTitle>
        <DialogContent dividers className="tiptapEditorPreviewDialogContent">
          <div className="tiptapEditorContent tiptapEditorPreviewContent">
            {previewHtml ? (
              <div
                className="tiptap"
                role="document"
                dangerouslySetInnerHTML={{ __html: previewHtml }}
                onClick={handlePreviewClick}
              />
            ) : (
              <div className="tiptap tiptapEditorPreviewEmpty">
                미리 볼 내용이 없습니다.
              </div>
            )}
          </div>
        </DialogContent>
        <DialogActions className="tiptapEditorPreviewActions">
          <button
            className="tiptapEditorPreviewCloseButton"
            type="button"
            onClick={closePreview}
          >
            닫기
          </button>
        </DialogActions>
      </Dialog>
    </>
  );
};
