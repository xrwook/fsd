import "./editor.css";

import Highlight from "@tiptap/extension-highlight";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import { TableKit } from "@tiptap/extension-table";
import TextAlign from "@tiptap/extension-text-align";
import { TextStyleKit } from "@tiptap/extension-text-style";
import { Placeholder } from "@tiptap/extensions";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import {
  type KeyboardEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { uploadEditorImage } from "./editor.service";
import { TiptapImageUpload } from "./tiptapImageUpload";
import { EditorToolbar } from "./ui/EditorToolbar";
import { EditorUploadStatus } from "./ui/EditorUploadStatus";

export type TiptapEditorProps = {
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

export default function TiptapEditor({
  value = "",
  placeholder = "내용을 입력하세요.",
  disabled = false,
  submitOnEnter = false,
  onChange,
  onEmptyChange,
  onSubmit,
  onUploadStateChange,
  uploadImage = uploadEditorImage,
}: TiptapEditorProps) {
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

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
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
      <EditorUploadStatus error={uploadError} uploadCount={uploadCount} />
    </div>
  );
}
