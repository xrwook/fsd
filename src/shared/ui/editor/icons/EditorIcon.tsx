import addIcon from "./add.svg";
import codeIcon from "./code.svg";
import deleteIcon from "./delete.svg";
import formatAlignCenterIcon from "./format_align_center.svg";
import formatAlignJustifyIcon from "./format_align_justify.svg";
import formatAlignLeftIcon from "./format_align_left.svg";
import formatAlignRightIcon from "./format_align_right.svg";
import formatBoldIcon from "./format_bold.svg";
import formatClearIcon from "./format_clear.svg";
import formatColorFillIcon from "./format_color_fill.svg";
import formatColorTextIcon from "./format_color_text.svg";
import formatItalicIcon from "./format_italic.svg";
import formatListBulletedIcon from "./format_list_bulleted.svg";
import formatListNumberedIcon from "./format_list_numbered.svg";
import formatQuoteIcon from "./format_quote.svg";
import horizontalRuleIcon from "./horizontal_rule.svg";
import imageIcon from "./image.svg";
import linkIcon from "./link.svg";
import redoIcon from "./redo.svg";
import removeIcon from "./remove.svg";
import strikethroughIcon from "./strikethrough_s.svg";
import tableIcon from "./table.svg";
import undoIcon from "./undo.svg";

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
