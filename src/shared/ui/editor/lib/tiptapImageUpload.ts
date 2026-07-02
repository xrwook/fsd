import { type Editor, Extension, type JSONContent } from "@tiptap/core";
import { Plugin } from "@tiptap/pm/state";

type ImageUploadOptions = {
  upload: (file: File) => Promise<string>;
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

const uploadAndInsertImages = (
  editor: Editor,
  options: ImageUploadOptions,
  files: File[],
  position: number,
) => {
  const imageFiles = getImageFiles(files);
  if (imageFiles.length === 0) return;

  const uploads = imageFiles.map(async (file) => {
    options.onUploadStart?.(file);

    try {
      const src = await options.upload(file);
      return {
        type: "image",
        attrs: { src, alt: file.name },
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
          handlePaste: (view, event) => {
            const files = getImageFiles(event.clipboardData?.files);
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
