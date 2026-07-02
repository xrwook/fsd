import { EditorIcon } from "./EditorIcon";
import type { EditorControlProps } from "./editorControl.types";
import { ToolbarButton } from "./ToolbarButton";

export const HistoryControls = ({ disabled, editor }: EditorControlProps) => {
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

  return (
    <div className="tiptap-toolbar__group">
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
    </div>
  );
};
