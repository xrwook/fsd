import type { ReactNode } from "react";

type Props = {
  color: string;
  disabled: boolean;
  icon: ReactNode;
  label: string;
  onChange: (color: string) => void;
};

export const ColorControl = ({
  color,
  disabled,
  icon,
  label,
  onChange,
}: Props) => (
  <label
    className={`tiptapToolbarColor ${disabled ? "controlDisabled" : ""}`}
    title={label}
  >
    <span aria-hidden="true">{icon}</span>
    <span
      className="tiptapToolbarColorIndicator"
      style={{ backgroundColor: color }}
    />
    <input
      aria-label={label}
      disabled={disabled}
      type="color"
      value={color}
      onChange={(event) => onChange(event.target.value)}
    />
  </label>
);
