import { MenuItem, Select } from "@mui/material";
import type { SelectChangeEvent } from "@mui/material/Select";
import type { ChangeEvent } from "react";

import { FONT_FAMILIES, FONT_SIZES } from "../config/font";
import type { EditorControlProps } from "../model/editorControl";
import { ColorControl } from "./_ColorControl";
import { EditorIcon } from "./_EditorIcon";
import { ToolbarButton } from "./_ToolbarButton";

type Props = EditorControlProps;
type HeadingLevel = 1 | 2 | 3 | 4;

const FONT_SELECT_SX = {
  height: 32,
  width: 122,
  backgroundColor: "#fff",
  color: "#374151",
  fontSize: 12,
  "& .MuiSelect-select": {
    alignItems: "center",
    display: "flex",
    minHeight: "unset",
    padding: "0 25px 0 8px",
  },
  "& .MuiOutlinedInput-notchedOutline": {
    borderColor: "#d1d5db",
    borderRadius: "5px",
  },
  "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
    borderColor: "#2563eb",
    borderWidth: "2px",
  },
  "&.Mui-disabled": {
    backgroundColor: "#f3f4f6",
    color: "#9ca3af",
    cursor: "not-allowed",
  },
} as const;

const FONT_SELECT_MENU_PROPS = {
  slotProps: {
    paper: {
      sx: {
        border: "1px solid #d1d5db",
        borderRadius: 0,
        boxShadow: "0 6px 16px rgb(15 23 42 / 12%)",
        mt: 0.5,
      },
    },
  },
} as const;

const FONT_MENU_ITEM_SX = {
  fontSize: 12,
  minHeight: 32,
  "&.Mui-selected": {
    backgroundColor: "#bada55",
    color: "#111827",
  },
  "&.Mui-selected:hover": {
    backgroundColor: "#bada55",
  },
  "&:hover": {
    backgroundColor: "rgb(186 218 85 / 24%)",
  },
} as const;

const colorInputValue = (color: unknown, fallback: string) =>
  typeof color === "string" && /^#[\da-f]{6}$/i.test(color) ? color : fallback;

const DEFAULT_FONT_FAMILY_VALUE = FONT_FAMILIES[0]?.value ?? "";

export const FontControls = ({ disabled, editor }: Props) => {
  const headingLevel = ([1, 2, 3, 4] as const).find((level) =>
    editor.isActive("heading", { level }),
  );
  const textStyle = editor.getAttributes("textStyle");
  const currentFontFamily = (textStyle.fontFamily as string | undefined) ?? "";
  const selectedFontFamilyValue =
    currentFontFamily || DEFAULT_FONT_FAMILY_VALUE;

  const handleHeadingChange = (event: ChangeEvent<HTMLSelectElement>) => {
    const value = event.target.value;
    const chain = editor.chain().focus();

    if (!value) {
      chain.setParagraph().run();
      return;
    }

    chain.setHeading({ level: Number(value) as HeadingLevel }).run();
  };

  const handleFontFamilyChange = (event: SelectChangeEvent<string>) => {
    const fontFamily = event.target.value;
    const chain = editor.chain().focus();

    if (fontFamily && fontFamily !== DEFAULT_FONT_FAMILY_VALUE) {
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

  return (
    <div className="tiptapToolbarGroup">
      <Select<string>
        aria-label="글꼴"
        className="tiptapToolbarSelectFont"
        displayEmpty
        disabled={disabled}
        MenuProps={FONT_SELECT_MENU_PROPS}
        size="small"
        sx={FONT_SELECT_SX}
        title="글꼴"
        value={selectedFontFamilyValue}
        variant="outlined"
        onChange={handleFontFamilyChange}
      >
        {FONT_FAMILIES.map((font) => (
          <MenuItem key={font.label} sx={FONT_MENU_ITEM_SX} value={font.value}>
            {font.label}
          </MenuItem>
        ))}
      </Select>
      <select
        aria-label="글자 크기"
        className="tiptapToolbarSelect tiptapToolbarSelectSize"
        disabled={disabled}
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
        className="tiptapToolbarSelect tiptapToolbarSelectHeading"
        disabled={disabled}
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
  );
};

export const InlineStyleControls = ({ disabled, editor }: Props) => {
  const textColor = colorInputValue(
    editor.getAttributes("textStyle").color,
    "#111827",
  );
  const highlightColor = colorInputValue(
    editor.getAttributes("highlight").color,
    "#fff59d",
  );

  return (
    <div className="tiptapToolbarGroup">
      <ToolbarButton
        active={editor.isActive("bold")}
        disabled={disabled}
        label="굵게"
        onClick={() => editor.chain().focus().toggleBold().run()}
      >
        <EditorIcon name="formatBold" />
      </ToolbarButton>
      <ToolbarButton
        active={editor.isActive("italic")}
        disabled={disabled}
        label="기울임"
        onClick={() => editor.chain().focus().toggleItalic().run()}
      >
        <EditorIcon name="formatItalic" />
      </ToolbarButton>
      <ToolbarButton
        active={editor.isActive("strike")}
        disabled={disabled}
        label="취소선"
        onClick={() => editor.chain().focus().toggleStrike().run()}
      >
        <EditorIcon name="strikethrough" />
      </ToolbarButton>
      <ColorControl
        color={textColor}
        disabled={disabled}
        icon={<EditorIcon name="formatColorText" />}
        label="글자색"
        onChange={(color) => editor.chain().focus().setColor(color).run()}
      />
      <ColorControl
        color={highlightColor}
        disabled={disabled}
        icon={<EditorIcon name="formatColorFill" />}
        label="배경색"
        onChange={(color) =>
          editor.chain().focus().setHighlight({ color }).run()
        }
      />
    </div>
  );
};
