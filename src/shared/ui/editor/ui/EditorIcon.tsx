import addIcon from "../assets/icons/add.svg";
import codeIcon from "../assets/icons/code.svg";
import deleteIcon from "../assets/icons/delete.svg";
import formatAlignCenterIcon from "../assets/icons/format_align_center.svg";
import formatAlignJustifyIcon from "../assets/icons/format_align_justify.svg";
import formatAlignLeftIcon from "../assets/icons/format_align_left.svg";
import formatAlignRightIcon from "../assets/icons/format_align_right.svg";
import formatBoldIcon from "../assets/icons/format_bold.svg";
import formatClearIcon from "../assets/icons/format_clear.svg";
import formatColorFillIcon from "../assets/icons/format_color_fill.svg";
import formatColorTextIcon from "../assets/icons/format_color_text.svg";
import formatItalicIcon from "../assets/icons/format_italic.svg";
import formatListBulletedIcon from "../assets/icons/format_list_bulleted.svg";
import formatListNumberedIcon from "../assets/icons/format_list_numbered.svg";
import formatQuoteIcon from "../assets/icons/format_quote.svg";
import horizontalRuleIcon from "../assets/icons/horizontal_rule.svg";
import imageIcon from "../assets/icons/image.svg";
import linkIcon from "../assets/icons/link.svg";
import redoIcon from "../assets/icons/redo.svg";
import removeIcon from "../assets/icons/remove.svg";
import strikethroughIcon from "../assets/icons/strikethrough_s.svg";
import tableIcon from "../assets/icons/table.svg";
import undoIcon from "../assets/icons/undo.svg";

const EDITOR_ICONS = {
  add: addIcon,
  code: codeIcon,
  delete: deleteIcon,
  formatAlignCenter: formatAlignCenterIcon,
  formatAlignJustify: formatAlignJustifyIcon,
  formatAlignLeft: formatAlignLeftIcon,
  formatAlignRight: formatAlignRightIcon,
  formatBold: formatBoldIcon,
  formatClear: formatClearIcon,
  formatColorFill: formatColorFillIcon,
  formatColorText: formatColorTextIcon,
  formatItalic: formatItalicIcon,
  formatListBulleted: formatListBulletedIcon,
  formatListNumbered: formatListNumberedIcon,
  formatQuote: formatQuoteIcon,
  horizontalRule: horizontalRuleIcon,
  image: imageIcon,
  link: linkIcon,
  redo: redoIcon,
  remove: removeIcon,
  strikethrough: strikethroughIcon,
  table: tableIcon,
  undo: undoIcon,
} as const;

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
