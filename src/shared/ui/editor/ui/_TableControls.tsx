import type { EditorControlProps } from "../model/editorControl";
import { EditorIcon } from "./_EditorIcon";
import { ToolbarButton } from "./_ToolbarButton";

type Props = EditorControlProps;

export const TableControls = ({ disabled, editor }: Props) => (
  <div className="tiptap-toolbar__group">
    <ToolbarButton
      className="tiptap-toolbar__button--text"
      disabled={disabled}
      label="행 추가"
      onClick={() => editor.chain().focus().addRowAfter().run()}
    >
      <EditorIcon name="add" />행
    </ToolbarButton>
    <ToolbarButton
      className="tiptap-toolbar__button--text"
      disabled={disabled}
      label="행 삭제"
      onClick={() => editor.chain().focus().deleteRow().run()}
    >
      <EditorIcon name="remove" />행
    </ToolbarButton>
    <ToolbarButton
      className="tiptap-toolbar__button--text"
      disabled={disabled}
      label="열 추가"
      onClick={() => editor.chain().focus().addColumnAfter().run()}
    >
      <EditorIcon name="add" />열
    </ToolbarButton>
    <ToolbarButton
      className="tiptap-toolbar__button--text"
      disabled={disabled}
      label="열 삭제"
      onClick={() => editor.chain().focus().deleteColumn().run()}
    >
      <EditorIcon name="remove" />열
    </ToolbarButton>
    <ToolbarButton
      disabled={disabled}
      label="표 삭제"
      onClick={() => editor.chain().focus().deleteTable().run()}
    >
      <EditorIcon name="delete" />
    </ToolbarButton>
  </div>
);
