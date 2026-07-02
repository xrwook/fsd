import { EDITOR_ICONS } from "../config/icon";

export type EditorIconName = keyof typeof EDITOR_ICONS;

type EditorIconProps = {
  name: EditorIconName;
};

export const EditorIcon = ({ name }: EditorIconProps) => {
  const iconUrl = EDITOR_ICONS[name];

  return (
    <span
      aria-hidden="true"
      className="tiptap-editor-icon"
      style={{
        maskImage: `url("${iconUrl}")`,
        WebkitMaskImage: `url("${iconUrl}")`,
      }}
    />
  );
};
