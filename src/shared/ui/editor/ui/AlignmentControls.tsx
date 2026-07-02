import { EditorIcon } from "./EditorIcon";
import type { EditorControlProps } from "./editorControl.types";
import { ToolbarButton } from "./ToolbarButton";

export const AlignmentControls = ({ disabled, editor }: EditorControlProps) => (
  <div className="tiptap-toolbar__group">
    <ToolbarButton
      active={editor.isActive({ textAlign: "left" })}
      disabled={disabled}
      label="왼쪽 정렬"
      onClick={() => editor.chain().focus().setTextAlign("left").run()}
    >
      <EditorIcon name="formatAlignLeft" />
    </ToolbarButton>
    <ToolbarButton
      active={editor.isActive({ textAlign: "center" })}
      disabled={disabled}
      label="가운데 정렬"
      onClick={() => editor.chain().focus().setTextAlign("center").run()}
    >
      <EditorIcon name="formatAlignCenter" />
    </ToolbarButton>
    <ToolbarButton
      active={editor.isActive({ textAlign: "right" })}
      disabled={disabled}
      label="오른쪽 정렬"
      onClick={() => editor.chain().focus().setTextAlign("right").run()}
    >
      <EditorIcon name="formatAlignRight" />
    </ToolbarButton>
    <ToolbarButton
      active={editor.isActive({ textAlign: "justify" })}
      disabled={disabled}
      label="양쪽 정렬"
      onClick={() => editor.chain().focus().setTextAlign("justify").run()}
    >
      <EditorIcon name="formatAlignJustify" />
    </ToolbarButton>
  </div>
);
