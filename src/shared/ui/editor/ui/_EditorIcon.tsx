import { EDITOR_ICONS } from "../config/icon";

export type EditorIconName = keyof typeof EDITOR_ICONS;

type EditorIconProps = {
  name: EditorIconName;
};

export const EditorIcon = ({ name }: EditorIconProps) => {
  const Icon = EDITOR_ICONS[name];

  return (
    <Icon aria-hidden="true" className="tiptapEditorIcon" focusable="false" />
  );
};
