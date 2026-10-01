import type { Editor } from "@tiptap/react";

import { AlignmentControls } from "./_AlignmentControls";
import { BlockControls } from "./_BlockControls";
import { EditorIcon } from "./_EditorIcon"; //
import { HistoryControls } from "./_HistoryControls";
import { InsertControls } from "./_InsertControls";
import { TableControls } from "./_TableControls";
import { FontControls, InlineStyleControls } from "./_TextStyleControls";
import { ToolbarButton } from "./_ToolbarButton"; //

type EditorToolbarProps = {
  allowImageUpload: boolean;
  disabled: boolean;
  editor: Editor | null;
  htmlSourceMode: "editor" | "preview" | "source"; //
  onToggleHtmlSource: () => void; //
};

const ToolbarDivider = () => <span className="tiptapToolbarDivider" />;

export const EditorToolbar = ({
  allowImageUpload,
  disabled,
  editor,
  htmlSourceMode, //
  onToggleHtmlSource, //
}: EditorToolbarProps) => {
  if (!editor) {
    return <div className="tiptapToolbar" aria-label="에디터 도구 모음" />;
  }

  if (htmlSourceMode !== "editor") {
    //
    return (
      <div
        className="tiptapToolbar"
        role="toolbar"
        aria-label="에디터 도구 모음"
      >
        <div className="tiptapToolbarGroup">
          <ToolbarButton
            active={htmlSourceMode === "source"}
            disabled={disabled}
            label="HTML 소스"
            onClick={onToggleHtmlSource}
          >
            <EditorIcon name="code" />
          </ToolbarButton>
        </div>
      </div>
    );
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
      <BlockControls
        {...controlProps}
        htmlSourceMode={htmlSourceMode} //
        onToggleHtmlSource={onToggleHtmlSource} //
      />
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
