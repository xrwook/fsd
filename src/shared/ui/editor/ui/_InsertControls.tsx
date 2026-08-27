import { type ChangeEvent, useRef } from "react";

import type { EditorControlProps } from "../model/editorControl";
import { EditorIcon } from "./_EditorIcon";
import { LinkPopover } from "./_LinkPopover";
import { ToolbarButton } from "./_ToolbarButton";

type Props = EditorControlProps & {
  allowImageUpload: boolean;
};

export const InsertControls = ({
  allowImageUpload,
  disabled,
  editor,
}: Props) => {
  const imageInputRef = useRef<HTMLInputElement>(null);

  const handleImageChange = (event: ChangeEvent<HTMLInputElement>) => {
    const files = [...(event.target.files ?? [])];
    editor.commands.uploadImages(files);
    event.target.value = "";
  };

  return (
    <div className="tiptapToolbarGroup">
      <LinkPopover disabled={disabled} editor={editor} />
      {allowImageUpload ? (
        <>
          <ToolbarButton
            disabled={disabled}
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
            disabled={disabled}
            type="file"
            onChange={handleImageChange}
          />
        </>
      ) : null}
      <ToolbarButton
        active={editor.isActive("table")}
        disabled={disabled}
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
  );
};
