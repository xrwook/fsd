import { type Editor, Extension, type JSONContent } from "@tiptap/core";
import { Plugin } from "@tiptap/pm/state";

export type ImageUploadResult =
  | string
  | {
      imgId?: string;
      src: string;
    };

type ImageUploadOptions = {
  enabled: boolean;
  upload: (file: File) => Promise<ImageUploadResult>;
  onUploadStart?: (file: File) => void;
  onUploadEnd?: (file: File) => void;
  onUploadError?: (error: unknown, file: File) => void;
};

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    tiptapImageUpload: {
      uploadImages: (files: File[], position?: number) => ReturnType;
    };
  }
}

const getImageFiles = (files?: FileList | File[] | null) =>
  [...(files ?? [])].filter((file) => file.type.startsWith("image/"));

const hasImageHtml = (html?: string | null) => !!html && /<img\b/i.test(html);

const removeImageElements = (html: string) => {
  if (!hasImageHtml(html)) return html;

  if (typeof document === "undefined") {
    return html.replaceAll(/<img\b[^>]*>/gi, "");
  }

  const template = document.createElement("template");
  template.innerHTML = html;
  for (const image of template.content.querySelectorAll("img")) {
    image.remove();
  }

  return template.innerHTML;
};

const toImageAttrs = (result: ImageUploadResult, file: File) => {
  if (typeof result === "string") {
    return { src: result, alt: file.name };
  }

  return {
    src: result.src,
    alt: file.name,
    imgId: result.imgId,
  };
};

const uploadAndInsertImages = (
  editor: Editor,
  options: ImageUploadOptions,
  files: File[],
  position: number,
) => {
  if (!options.enabled) return;

  const imageFiles = getImageFiles(files);
  if (imageFiles.length === 0) return;

  const uploads = imageFiles.map(async (file) => {
    options.onUploadStart?.(file);

    try {
      const result = await options.upload(file);
      return {
        type: "image",
        attrs: toImageAttrs(result, file),
      } as JSONContent;
    } catch (error: unknown) {
      options.onUploadError?.(error, file);
      return null;
    } finally {
      options.onUploadEnd?.(file);
    }
  });

  Promise.all(uploads)
    .then((images) => {
      if (editor.isDestroyed) return;

      const uploadedImages = images.filter(
        (image): image is JSONContent => image !== null,
      );
      if (uploadedImages.length === 0) return;

      const safePosition = Math.min(position, editor.state.doc.content.size);
      editor.commands.insertContentAt(safePosition, uploadedImages, {
        updateSelection: true,
      });
    })
    .catch(() => {});
};

export const TiptapImageUpload = Extension.create<ImageUploadOptions>({
  name: "tiptapImageUpload",

  addOptions() {
    return {
      enabled: true,
      upload: async () => {
        throw new Error("TiptapImageUpload의 upload 옵션이 필요합니다.");
      },
    };
  },

  addCommands() {
    return {
      uploadImages:
        (files, position) =>
        ({ editor }) => {
          if (!this.options.enabled) return false;

          uploadAndInsertImages(
            editor,
            this.options,
            files,
            position ?? editor.state.selection.from,
          );
          return true;
        },
    };
  },

  addProseMirrorPlugins() {
    return [
      new Plugin({
        props: {
          transformPastedHTML: (html) =>
            this.options.enabled ? html : removeImageElements(html),
          handlePaste: (view, event) => {
            const files = getImageFiles(event.clipboardData?.files);
            if (!this.options.enabled) {
              if (files.length > 0) {
                event.preventDefault();
                return true;
              }

              return false;
            }

            if (files.length === 0) return false;

            event.preventDefault();
            uploadAndInsertImages(
              this.editor,
              this.options,
              files,
              view.state.selection.from,
            );
            return true;
          },
          handleDrop: (view, event) => {
            const files = getImageFiles(event.dataTransfer?.files);
            if (!this.options.enabled) {
              if (
                files.length > 0 ||
                hasImageHtml(event.dataTransfer?.getData("text/html"))
              ) {
                event.preventDefault();
                return true;
              }

              return false;
            }

            if (files.length === 0) return false;

            event.preventDefault();
            const dropPosition = view.posAtCoords({
              left: event.clientX,
              top: event.clientY,
            });

            uploadAndInsertImages(
              this.editor,
              this.options,
              files,
              dropPosition?.pos ?? view.state.selection.from,
            );
            return true;
          },
        },
      }),
    ];
  },
});
