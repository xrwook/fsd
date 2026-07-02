import type { ChangeEvent } from "react";

import { EditorIcon } from "./EditorIcon";
import { ColorControl } from "./ColorControl";
import type { EditorControlProps } from "./editorControl.types";
import { ToolbarButton } from "./ToolbarButton";

type HeadingLevel = 1 | 2 | 3 | 4;

const FONT_FAMILIES = [
  { label: "기본 글꼴", value: "" },
  { label: "Arial", value: "Arial, sans-serif" },
  { label: "Noto Sans KR", value: "'Noto Sans KR', sans-serif" },
  { label: "Georgia", value: "Georgia, serif" },
  { label: "Courier New", value: "'Courier New', monospace" },
] as const;

const FONT_SIZES = [
  "10px",
  "12px",
  "14px",
  "16px",
  "18px",
  "20px",
  "24px",
  "28px",
  "32px",
  "36px",
  "48px",
] as const;

const colorInputValue = (color: unknown, fallback: string) =>
  typeof color === "string" && /^#[\da-f]{6}$/i.test(color) ? color : fallback;

export const FontControls = ({ disabled, editor }: EditorControlProps) => {
  const headingLevel = ([1, 2, 3, 4] as const).find((level) =>
    editor.isActive("heading", { level }),
  );
  const textStyle = editor.getAttributes("textStyle");

  const handleHeadingChange = (event: ChangeEvent<HTMLSelectElement>) => {
    const value = event.target.value;
    const chain = editor.chain().focus();

    if (!value) {
      chain.setParagraph().run();
      return;
    }

    chain.setHeading({ level: Number(value) as HeadingLevel }).run();
  };

  const handleFontFamilyChange = (event: ChangeEvent<HTMLSelectElement>) => {
    const fontFamily = event.target.value;
    const chain = editor.chain().focus();

    if (fontFamily) {
      chain.setFontFamily(fontFamily).run();
    } else {
      chain.unsetFontFamily().run();
    }
  };

  const handleFontSizeChange = (event: ChangeEvent<HTMLSelectElement>) => {
    const fontSize = event.target.value;
    const chain = editor.chain().focus();

    if (fontSize) {
      chain.setFontSize(fontSize).run();
    } else {
      chain.unsetFontSize().run();
    }
  };

  return (
    <div className="tiptap-toolbar__group">
      <select
        aria-label="글꼴"
        className="tiptap-toolbar__select tiptap-toolbar__select--font"
        disabled={disabled}
        title="글꼴"
        value={(textStyle.fontFamily as string | undefined) ?? ""}
        onChange={handleFontFamilyChange}
      >
        {FONT_FAMILIES.map((font) => (
          <option key={font.label} value={font.value}>
            {font.label}
          </option>
        ))}
      </select>
      <select
        aria-label="글자 크기"
        className="tiptap-toolbar__select tiptap-toolbar__select--size"
        disabled={disabled}
        title="글자 크기"
        value={(textStyle.fontSize as string | undefined) ?? ""}
        onChange={handleFontSizeChange}
      >
        <option value="">크기</option>
        {FONT_SIZES.map((size) => (
          <option key={size} value={size}>
            {size}
          </option>
        ))}
      </select>
      <select
        aria-label="제목"
        className="tiptap-toolbar__select tiptap-toolbar__select--heading"
        disabled={disabled}
        title="제목"
        value={headingLevel ?? ""}
        onChange={handleHeadingChange}
      >
        <option value="">본문</option>
        <option value="1">제목 1</option>
        <option value="2">제목 2</option>
        <option value="3">제목 3</option>
        <option value="4">제목 4</option>
      </select>
    </div>
  );
};

export const InlineStyleControls = ({
  disabled,
  editor,
}: EditorControlProps) => {
  const textColor = colorInputValue(
    editor.getAttributes("textStyle").color,
    "#111827",
  );
  const highlightColor = colorInputValue(
    editor.getAttributes("highlight").color,
    "#fff59d",
  );

  return (
    <div className="tiptap-toolbar__group">
      <ToolbarButton
        active={editor.isActive("bold")}
        disabled={disabled}
        label="굵게"
        onClick={() => editor.chain().focus().toggleBold().run()}
      >
        <EditorIcon name="formatBold" />
      </ToolbarButton>
      <ToolbarButton
        active={editor.isActive("italic")}
        disabled={disabled}
        label="기울임"
        onClick={() => editor.chain().focus().toggleItalic().run()}
      >
        <EditorIcon name="formatItalic" />
      </ToolbarButton>
      <ToolbarButton
        active={editor.isActive("strike")}
        disabled={disabled}
        label="취소선"
        onClick={() => editor.chain().focus().toggleStrike().run()}
      >
        <EditorIcon name="strikethrough" />
      </ToolbarButton>
      <ColorControl
        color={textColor}
        disabled={disabled}
        icon={<EditorIcon name="formatColorText" />}
        label="글자색"
        onChange={(color) => editor.chain().focus().setColor(color).run()}
      />
      <ColorControl
        color={highlightColor}
        disabled={disabled}
        icon={<EditorIcon name="formatColorFill" />}
        label="배경색"
        onChange={(color) =>
          editor.chain().focus().setHighlight({ color }).run()
        }
      />
    </div>
  );
};
