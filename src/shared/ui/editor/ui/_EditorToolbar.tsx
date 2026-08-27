import type { Editor } from "@tiptap/react";

import { AlignmentControls } from "./_AlignmentControls";
import { BlockControls } from "./_BlockControls";
import { HistoryControls } from "./_HistoryControls";
import { InsertControls } from "./_InsertControls";
import { TableControls } from "./_TableControls";
import { FontControls, InlineStyleControls } from "./_TextStyleControls";

type EditorToolbarProps = {
  allowImageUpload: boolean;
  disabled: boolean;
  editor: Editor | null;
};

const ToolbarDivider = () => <span className="tiptapToolbarDivider" />;

export const EditorToolbar = ({
  allowImageUpload,
  disabled,
  editor,
}: EditorToolbarProps) => {
  if (!editor) {
    return <div className="tiptapToolbar" aria-label="에디터 도구 모음" />;
  }

  const controlProps = {
    disabled,
    editor,
  };

  return (
    <div className="tiptapToolbar" role="toolbar" aria-label="에디터 도구 모음">
      <FontControls {...controlProps} />
      <ToolbarDivider />
      <InlineStyleControls {...controlProps} />
      <ToolbarDivider />
      <BlockControls {...controlProps} />
      <ToolbarDivider />
      <AlignmentControls {...controlProps} />
      <ToolbarDivider />
      <InsertControls {...controlProps} allowImageUpload={allowImageUpload} />

      {editor.isActive("table") && (
        <>
          <ToolbarDivider />
          <TableControls {...controlProps} />
        </>
      )}

      <ToolbarDivider />
      <HistoryControls {...controlProps} />
    </div>
  );
};
