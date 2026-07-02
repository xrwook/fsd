import type { Editor } from "@tiptap/react";

import { AlignmentControls } from "./AlignmentControls";
import { BlockControls } from "./BlockControls";
import { HistoryControls } from "./HistoryControls";
import { InsertControls } from "./InsertControls";
import { TableControls } from "./TableControls";
import { FontControls, InlineStyleControls } from "./TextStyleControls";

type EditorToolbarProps = {
  disabled: boolean;
  editor: Editor | null;
};

const ToolbarDivider = () => <span className="tiptap-toolbar__divider" />;

export const EditorToolbar = ({ disabled, editor }: EditorToolbarProps) => {
  if (!editor) {
    return <div className="tiptap-toolbar" aria-label="에디터 도구 모음" />;
  }

  const controlProps = {
    disabled,
    editor,
  };

  return (
    <div
      className="tiptap-toolbar"
      role="toolbar"
      aria-label="에디터 도구 모음"
    >
      <FontControls {...controlProps} />
      <ToolbarDivider />
      <InlineStyleControls {...controlProps} />
      <ToolbarDivider />
      <BlockControls {...controlProps} />
      <ToolbarDivider />
      <AlignmentControls {...controlProps} />
      <ToolbarDivider />
      <InsertControls {...controlProps} />

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
