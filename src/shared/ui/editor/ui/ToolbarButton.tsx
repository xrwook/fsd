import type { ButtonHTMLAttributes, ReactNode } from "react";

type ToolbarButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  active?: boolean;
  children: ReactNode;
  label: string;
};

export const ToolbarButton = ({
  active = false,
  children,
  className = "",
  label,
  ...buttonProps
}: ToolbarButtonProps) => (
  <button
    {...buttonProps}
    type="button"
    aria-label={label}
    aria-pressed={active}
    className={`tiptap-toolbar__button ${active ? "is-active" : ""} ${className}`}
    title={label}
  >
    {children}
  </button>
);
