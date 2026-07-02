import "./editor.css";

import Highlight from "@tiptap/extension-highlight";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import { TableKit } from "@tiptap/extension-table";
import TextAlign from "@tiptap/extension-text-align";
import { TextStyleKit } from "@tiptap/extension-text-style";
import { Placeholder } from "@tiptap/extensions";
import { type Editor, EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import {
  type ButtonHTMLAttributes,
  type ChangeEvent,
  type ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { uploadEditorImage } from "./editor.service";
import { EditorIcon } from "./icons/EditorIcon";
import { TiptapImageUpload } from "./tiptapImageUpload";

export type TiptapImageEditorProps = {
  value?: string;
  placeholder?: string;
  disabled?: boolean;
  submitOnEnter?: boolean;
  onChange?: (value: string) => void;
  onEmptyChange?: (isEmpty: boolean) => void;
  onSubmit?: () => void;
  onUploadStateChange?: (isUploading: boolean) => void;
  uploadImage?: (file: File) => Promise<string>;
};

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

const normalizeLink = (url: string) => {
  const trimmedUrl = url.trim();

  if (/^(https?:\/\/|mailto:|tel:|\/|#)/i.test(trimmedUrl)) {
    return trimmedUrl;
  }

  return `https://${trimmedUrl}`;
};

const colorInputValue = (color: unknown, fallback: string) =>
  typeof color === "string" && /^#[\da-f]{6}$/i.test(color) ? color : fallback;

type ToolbarButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  active?: boolean;
  label: string;
  children: ReactNode;
};

const ToolbarButton = ({
  active = false,
  label,
  children,
  className = "",
  ...buttonProps
}: ToolbarButtonProps) => (
  <button
    {...buttonProps}
    type="button"
    aria-label={label}
    aria-pressed={active}
    className={`tiptap-toolbar__button ${active ? "is-active" : ""} ${className}`}
    title={label}
  >
    {children}
  </button>
);

type ColorControlProps = {
  color: string;
  disabled: boolean;
  icon: ReactNode;
  label: string;
  onChange: (color: string) => void;
};

const ColorControl = ({
  color,
  disabled,
  icon,
  label,
  onChange,
}: ColorControlProps) => (
  <label
    className={`tiptap-toolbar__color ${disabled ? "is-disabled" : ""}`}
    title={label}
  >
    <span aria-hidden="true">{icon}</span>
    <span
      className="tiptap-toolbar__color-indicator"
      style={{ backgroundColor: color }}
    />
    <input
      aria-label={label}
      disabled={disabled}
      type="color"
      value={color}
      onChange={(event) => onChange(event.target.value)}
    />
  </label>
);

type EditorToolbarProps = {
  disabled: boolean;
  editor: Editor | null;
};

const EditorToolbar = ({ disabled, editor }: EditorToolbarProps) => {
  const imageInputRef = useRef<HTMLInputElement>(null);
  const controlsDisabled = disabled || !editor;

  if (!editor) {
    return <div className="tiptap-toolbar" aria-label="에디터 도구 모음" />;
  }

  const headingLevel = ([1, 2, 3, 4] as const).find((level) =>
    editor.isActive("heading", { level }),
  );
  const textStyle = editor.getAttributes("textStyle");
  const textColor = colorInputValue(textStyle.color, "#111827");
  const highlightColor = colorInputValue(
    editor.getAttributes("highlight").color,
    "#fff59d",
  );

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

  const handleLink = () => {
    const currentUrl = editor.getAttributes("link").href as string | undefined;
    const url = window.prompt("링크 URL을 입력하세요.", currentUrl ?? "");

    if (url === null) return;
    if (!url.trim()) {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }

    editor
      .chain()
      .focus()
      .extendMarkRange("link")
      .setLink({ href: normalizeLink(url) })
      .run();
  };

  const handleImageChange = (event: ChangeEvent<HTMLInputElement>) => {
    const files = [...(event.target.files ?? [])];
    editor.commands.uploadImages(files);
    event.target.value = "";
  };

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
    <div
      className="tiptap-toolbar"
      role="toolbar"
      aria-label="에디터 도구 모음"
    >
      <div className="tiptap-toolbar__group">
        <select
          aria-label="글꼴"
          className="tiptap-toolbar__select tiptap-toolbar__select--font"
          disabled={controlsDisabled}
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
          disabled={controlsDisabled}
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
          disabled={controlsDisabled}
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

      <span className="tiptap-toolbar__divider" />

      <div className="tiptap-toolbar__group">
        <ToolbarButton
          active={editor.isActive("bold")}
          disabled={controlsDisabled}
          label="굵게"
          onClick={() => editor.chain().focus().toggleBold().run()}
        >
          <EditorIcon name="formatBold" />
        </ToolbarButton>
        <ToolbarButton
          active={editor.isActive("italic")}
          disabled={controlsDisabled}
          label="기울임"
          onClick={() => editor.chain().focus().toggleItalic().run()}
        >
          <EditorIcon name="formatItalic" />
        </ToolbarButton>
        <ToolbarButton
          active={editor.isActive("strike")}
          disabled={controlsDisabled}
          label="취소선"
          onClick={() => editor.chain().focus().toggleStrike().run()}
        >
          <EditorIcon name="strikethrough" />
        </ToolbarButton>
        <ColorControl
          color={textColor}
          disabled={controlsDisabled}
          icon={<EditorIcon name="formatColorText" />}
          label="글자색"
          onChange={(color) => editor.chain().focus().setColor(color).run()}
        />
        <ColorControl
          color={highlightColor}
          disabled={controlsDisabled}
          icon={<EditorIcon name="formatColorFill" />}
          label="배경색"
          onChange={(color) =>
            editor.chain().focus().setHighlight({ color }).run()
          }
        />
      </div>

      <span className="tiptap-toolbar__divider" />

      <div className="tiptap-toolbar__group">
        <ToolbarButton
          active={editor.isActive("bulletList")}
          disabled={controlsDisabled}
          label="글머리 기호 목록"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
        >
          <EditorIcon name="formatListBulleted" />
        </ToolbarButton>
        <ToolbarButton
          active={editor.isActive("orderedList")}
          disabled={controlsDisabled}
          label="번호 목록"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
        >
          <EditorIcon name="formatListNumbered" />
        </ToolbarButton>
        <ToolbarButton
          active={editor.isActive("blockquote")}
          disabled={controlsDisabled}
          label="인용문"
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
        >
          <EditorIcon name="formatQuote" />
        </ToolbarButton>
        <ToolbarButton
          active={editor.isActive("codeBlock")}
          disabled={controlsDisabled}
          label="코드 블록"
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
        >
          <EditorIcon name="code" />
        </ToolbarButton>
        <ToolbarButton
          disabled={controlsDisabled}
          label="구분선"
          onClick={() => editor.chain().focus().setHorizontalRule().run()}
        >
          <EditorIcon name="horizontalRule" />
        </ToolbarButton>
      </div>

      <span className="tiptap-toolbar__divider" />

      <div className="tiptap-toolbar__group">
        <ToolbarButton
          active={editor.isActive({ textAlign: "left" })}
          disabled={controlsDisabled}
          label="왼쪽 정렬"
          onClick={() => editor.chain().focus().setTextAlign("left").run()}
        >
          <EditorIcon name="formatAlignLeft" />
        </ToolbarButton>
        <ToolbarButton
          active={editor.isActive({ textAlign: "center" })}
          disabled={controlsDisabled}
          label="가운데 정렬"
          onClick={() => editor.chain().focus().setTextAlign("center").run()}
        >
          <EditorIcon name="formatAlignCenter" />
        </ToolbarButton>
        <ToolbarButton
          active={editor.isActive({ textAlign: "right" })}
          disabled={controlsDisabled}
          label="오른쪽 정렬"
          onClick={() => editor.chain().focus().setTextAlign("right").run()}
        >
          <EditorIcon name="formatAlignRight" />
        </ToolbarButton>
        <ToolbarButton
          active={editor.isActive({ textAlign: "justify" })}
          disabled={controlsDisabled}
          label="양쪽 정렬"
          onClick={() => editor.chain().focus().setTextAlign("justify").run()}
        >
          <EditorIcon name="formatAlignJustify" />
        </ToolbarButton>
      </div>

      <span className="tiptap-toolbar__divider" />

      <div className="tiptap-toolbar__group">
        <ToolbarButton
          active={editor.isActive("link")}
          disabled={controlsDisabled}
          label="링크 설정"
          onClick={handleLink}
        >
          <EditorIcon name="link" />
        </ToolbarButton>
        <ToolbarButton
          disabled={controlsDisabled || !editor.isActive("link")}
          label="링크 제거"
          onClick={() =>
            editor.chain().focus().extendMarkRange("link").unsetLink().run()
          }
        >
          <EditorIcon name="linkOff" />
        </ToolbarButton>
        <ToolbarButton
          disabled={controlsDisabled}
          label="이미지 업로드"
          onClick={() => imageInputRef.current?.click()}
        >
          <EditorIcon name="image" />
        </ToolbarButton>
        <input
          ref={imageInputRef}
          hidden
          multiple
          accept="image/*"
          disabled={controlsDisabled}
          type="file"
          onChange={handleImageChange}
        />
        <ToolbarButton
          active={editor.isActive("table")}
          disabled={controlsDisabled}
          label="표 삽입"
          onClick={() =>
            editor
              .chain()
              .focus()
              .insertTable({ rows: 3, cols: 3, withHeaderRow: true })
              .run()
          }
        >
          <EditorIcon name="table" />
        </ToolbarButton>
      </div>

      {editor.isActive("table") && (
        <>
          <span className="tiptap-toolbar__divider" />
          <div className="tiptap-toolbar__group">
            <ToolbarButton
              className="tiptap-toolbar__button--text"
              disabled={controlsDisabled}
              label="행 추가"
              onClick={() => editor.chain().focus().addRowAfter().run()}
            >
              <EditorIcon name="add" />행
            </ToolbarButton>
            <ToolbarButton
              className="tiptap-toolbar__button--text"
              disabled={controlsDisabled}
              label="행 삭제"
              onClick={() => editor.chain().focus().deleteRow().run()}
            >
              <EditorIcon name="remove" />행
            </ToolbarButton>
            <ToolbarButton
              className="tiptap-toolbar__button--text"
              disabled={controlsDisabled}
              label="열 추가"
              onClick={() => editor.chain().focus().addColumnAfter().run()}
            >
              <EditorIcon name="add" />열
            </ToolbarButton>
            <ToolbarButton
              className="tiptap-toolbar__button--text"
              disabled={controlsDisabled}
              label="열 삭제"
              onClick={() => editor.chain().focus().deleteColumn().run()}
            >
              <EditorIcon name="remove" />열
            </ToolbarButton>
            <ToolbarButton
              disabled={controlsDisabled}
              label="표 삭제"
              onClick={() => editor.chain().focus().deleteTable().run()}
            >
              <EditorIcon name="delete" />
            </ToolbarButton>
          </div>
        </>
      )}

      <span className="tiptap-toolbar__divider" />

      <div className="tiptap-toolbar__group">
        <ToolbarButton
          disabled={controlsDisabled || !editor.can().undo()}
          label="실행 취소"
          onClick={() => editor.chain().focus().undo().run()}
        >
          <EditorIcon name="undo" />
        </ToolbarButton>
        <ToolbarButton
          disabled={controlsDisabled || !editor.can().redo()}
          label="다시 실행"
          onClick={() => editor.chain().focus().redo().run()}
        >
          <EditorIcon name="redo" />
        </ToolbarButton>
        <ToolbarButton
          disabled={controlsDisabled}
          label="서식 지우기"
          onClick={clearFormatting}
        >
          <EditorIcon name="formatClear" />
        </ToolbarButton>
      </div>
    </div>
  );
};

export default function TiptapImageEditor({
  value = "",
  placeholder = "내용을 입력하세요.",
  disabled = false,
  submitOnEnter = false,
  onChange,
  onEmptyChange,
  onSubmit,
  onUploadStateChange,
  uploadImage = uploadEditorImage,
}: TiptapImageEditorProps) {
  const [uploadCount, setUploadCount] = useState(0);
  const [uploadError, setUploadError] = useState("");
  const emittedValueRef = useRef(value);
  const onChangeRef = useRef(onChange);
  const onEmptyChangeRef = useRef(onEmptyChange);
  const onSubmitRef = useRef(onSubmit);
  const uploadImageRef = useRef(uploadImage);

  useEffect(() => {
    onChangeRef.current = onChange;
    onEmptyChangeRef.current = onEmptyChange;
    onSubmitRef.current = onSubmit;
    uploadImageRef.current = uploadImage;
  }, [onChange, onEmptyChange, onSubmit, uploadImage]);

  useEffect(() => {
    onUploadStateChange?.(uploadCount > 0);
  }, [onUploadStateChange, uploadCount]);

  const increaseUploadCount = useCallback(() => {
    setUploadError("");
    setUploadCount((count) => count + 1);
  }, []);

  const decreaseUploadCount = useCallback(() => {
    setUploadCount((count) => Math.max(0, count - 1));
  }, []);

  const imageUploadExtension = useMemo(
    () =>
      TiptapImageUpload.configure({
        upload: (file) => uploadImageRef.current(file),
        onUploadStart: increaseUploadCount,
        onUploadEnd: decreaseUploadCount,
        onUploadError: (_error, file) => {
          setUploadError(`${file.name} 이미지 업로드에 실패했습니다.`);
        },
      }),
    [decreaseUploadCount, increaseUploadCount],
  );

  const editor = useEditor(
    {
      extensions: [
        StarterKit.configure({
          link: false,
        }),
        Link.configure({
          autolink: true,
          defaultProtocol: "https",
          openOnClick: false,
          HTMLAttributes: {
            rel: "noopener noreferrer nofollow",
            target: "_blank",
          },
        }),
        TextStyleKit.configure({
          backgroundColor: false,
          lineHeight: false,
        }),
        Highlight.configure({
          multicolor: true,
        }),
        TextAlign.configure({
          types: ["heading", "paragraph"],
        }),
        TableKit.configure({
          table: {
            resizable: true,
            HTMLAttributes: {
              class: "tiptap-table",
            },
          },
        }),
        Image.configure({
          inline: true,
          allowBase64: false,
          HTMLAttributes: {
            class: "tiptap-uploaded-image",
          },
        }),
        Placeholder.configure({
          placeholder,
        }),
        imageUploadExtension,
      ],
      content: value,
      editable: !disabled,
      immediatelyRender: true,
      shouldRerenderOnTransaction: true,
      onCreate: ({ editor: currentEditor }) => {
        onEmptyChangeRef.current?.(currentEditor.isEmpty);
      },
      onUpdate: ({ editor: currentEditor }) => {
        const nextValue = currentEditor.isEmpty ? "" : currentEditor.getHTML();

        emittedValueRef.current = nextValue;
        onChangeRef.current?.(nextValue);
        onEmptyChangeRef.current?.(currentEditor.isEmpty);
      },
    },
    [imageUploadExtension, placeholder],
  );

  useEffect(() => {
    if (!editor) return;
    editor.setEditable(!disabled);
  }, [disabled, editor]);

  useEffect(() => {
    if (!editor || value === emittedValueRef.current) return;

    emittedValueRef.current = value;
    editor.commands.setContent(value, { emitUpdate: false });
    onEmptyChangeRef.current?.(editor.isEmpty);
  }, [editor, value]);

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (
      !submitOnEnter ||
      event.shiftKey ||
      event.key !== "Enter" ||
      event.nativeEvent.isComposing
    ) {
      return;
    }

    event.preventDefault();
    onSubmitRef.current?.();
  };

  return (
    <div
      className={`tiptap-editor ${disabled ? "is-disabled" : ""}`}
      aria-busy={uploadCount > 0}
    >
      <EditorToolbar disabled={disabled} editor={editor} />
      <EditorContent
        editor={editor}
        className={`tiptap-editor__content ${
          submitOnEnter ? "is-single-line" : ""
        }`}
        onKeyDown={handleKeyDown}
      />
      {(uploadCount > 0 || uploadError) && (
        <div className="tiptap-editor__status" aria-live="polite">
          {uploadCount > 0 && (
            <span className="tiptap-editor__uploading">
              <span className="tiptap-editor__spinner" aria-hidden="true" />
              이미지 업로드 중... ({uploadCount})
            </span>
          )}
          {uploadError && (
            <span className="tiptap-editor__error">{uploadError}</span>
          )}
        </div>
      )}
    </div>
  );
}
