import "../assets/editor.css";

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

import { uploadEditorImage } from "../api/editor.service";
import { DesignedHtmlExtensions } from "../lib/tiptapDesignedHtml";
import {
  type ImageUploadResult,
  TiptapImageUpload,
} from "../lib/tiptapImageUpload";
import { EditorToolbar } from "./_EditorToolbar";
import { EditorUploadStatus } from "./_EditorUploadStatus";

export type TiptapEditorProps = {
  value?: string;
  placeholder?: string;
  disabled?: boolean;
  submitOnEnter?: boolean;
  referenceType: string;
  onChange?: (value: string) => void;
  onEmptyChange?: (isEmpty: boolean) => void;
  onSubmit?: () => void;
  onUploadStateChange?: (isUploading: boolean) => void;
  uploadImage?: (
    file: File,
    referenceType: string,
  ) => Promise<ImageUploadResult>;
  allowImageUpload?: boolean;
};

const TiptapImage = Image.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      fileDetailId: {
        default: null,
        parseHTML: (element) =>
          element.dataset.fileDetailId ?? element.dataset.imgid,
        renderHTML: (attributes) => {
          const fileDetailId =
            typeof attributes.fileDetailId === "string"
              ? attributes.fileDetailId
              : "";

          if (!fileDetailId) {
            return {};
          }

          return {
            "data-file-detail-id": fileDetailId,
          };
        },
      },
    };
  },
});

export default function TiptapEditor({
  value = "",
  placeholder = "내용을 입력하세요.",
  disabled = false,
  submitOnEnter = false,
  referenceType,
  onChange,
  onEmptyChange,
  onSubmit,
  onUploadStateChange,
  uploadImage = uploadEditorImage,
  allowImageUpload = true,
}: TiptapEditorProps) {
  const [uploadCount, setUploadCount] = useState(0);
  const [uploadError, setUploadError] = useState("");
  const emittedValueRef = useRef(value);
  const onChangeRef = useRef(onChange);
  const onEmptyChangeRef = useRef(onEmptyChange);
  const onSubmitRef = useRef(onSubmit);
  const referenceTypeRef = useRef(referenceType);
  const uploadImageRef = useRef(uploadImage);

  useEffect(() => {
    onChangeRef.current = onChange;
    onEmptyChangeRef.current = onEmptyChange;
    onSubmitRef.current = onSubmit;
    referenceTypeRef.current = referenceType;
    uploadImageRef.current = uploadImage;
  }, [onChange, onEmptyChange, onSubmit, referenceType, uploadImage]);

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
        enabled: allowImageUpload,
        upload: (file) => {
          const uploadReferenceType = referenceTypeRef.current.trim();
          if (!uploadReferenceType) {
            throw new Error(
              "TiptapEditor 이미지 업로드 referenceType이 필요합니다.",
            );
          }

          return uploadImageRef.current(file, uploadReferenceType);
        },
        onUploadStart: increaseUploadCount,
        onUploadEnd: decreaseUploadCount,
        onUploadError: (_error, file) => {
          setUploadError(`${file.name} 이미지 업로드에 실패했습니다.`);
        },
      }),
    [allowImageUpload, decreaseUploadCount, increaseUploadCount],
  );

  const editor = useEditor(
    {
      extensions: [
        ...DesignedHtmlExtensions,
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
              class: "tiptapTable",
            },
          },
        }),
        TiptapImage.configure({
          inline: true,
          allowBase64: false,
          HTMLAttributes: {
            class: "tiptapUploadedImage",
          },
        }),
        Placeholder.configure({
          emptyEditorClass: "isEditorEmpty",
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
      className={`tiptapEditor ${disabled ? "editorDisabled" : ""}`}
      aria-busy={uploadCount > 0}
    >
      <EditorToolbar
        allowImageUpload={allowImageUpload}
        disabled={disabled}
        editor={editor}
      />
      <EditorContent
        editor={editor}
        className={`tiptapEditorContent ${submitOnEnter ? "singleLine" : ""}`}
        onKeyDown={handleKeyDown}
      />
      <EditorUploadStatus error={uploadError} uploadCount={uploadCount} />
    </div>
  );
}
