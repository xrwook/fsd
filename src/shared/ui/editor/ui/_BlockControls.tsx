import type { EditorControlProps } from "../model/editorControl";
import { EditorIcon } from "./_EditorIcon";
import { ToolbarButton } from "./_ToolbarButton";

type Props = EditorControlProps;

export const BlockControls = ({ disabled, editor }: Props) => (
  <div className="tiptap-toolbar__group">
    <ToolbarButton
      active={editor.isActive("bulletList")}
      disabled={disabled}
      label="글머리 기호 목록"
      onClick={() => editor.chain().focus().toggleBulletList().run()}
    >
      <EditorIcon name="formatListBulleted" />
    </ToolbarButton>
    <ToolbarButton
      active={editor.isActive("orderedList")}
      disabled={disabled}
      label="번호 목록"
      onClick={() => editor.chain().focus().toggleOrderedList().run()}
    >
      <EditorIcon name="formatListNumbered" />
    </ToolbarButton>
    <ToolbarButton
      active={editor.isActive("blockquote")}
      disabled={disabled}
      label="인용문"
      onClick={() => editor.chain().focus().toggleBlockquote().run()}
    >
      <EditorIcon name="formatQuote" />
    </ToolbarButton>
    <ToolbarButton
      active={editor.isActive("codeBlock")}
      disabled={disabled}
      label="코드 블록"
      onClick={() => editor.chain().focus().toggleCodeBlock().run()}
    >
      <EditorIcon name="code" />
    </ToolbarButton>
    <ToolbarButton
      disabled={disabled}
      label="구분선"
      onClick={() => editor.chain().focus().setHorizontalRule().run()}
    >
      <EditorIcon name="horizontalRule" />
    </ToolbarButton>
  </div>
);
