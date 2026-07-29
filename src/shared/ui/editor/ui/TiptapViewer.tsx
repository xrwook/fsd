import "../assets/editor.css";

import { type MouseEvent } from "react";

export type TiptapViewerProps = {
  value?: string | null;
  className?: string;
  contentClassName?: string;
  emptyText?: string;
  onHrefClick?: (href: string) => void;
};

const joinClassNames = (...classNames: Array<string | undefined>) =>
  classNames.filter(Boolean).join(" ");

export default function TiptapViewer({
  value,
  className,
  contentClassName,
  emptyText = "(작성된 내용이 없습니다.)",
  onHrefClick,
}: TiptapViewerProps) {
  const handleClick = (event: MouseEvent<HTMLDivElement>) => {
    const target = event.target;
    if (!(target instanceof HTMLElement)) return;

    const button = target.closest<HTMLButtonElement>("button[data-href]");
    const href = button?.dataset.href;
    if (!href) return;

    if (onHrefClick) {
      onHrefClick(href);
      return;
    }

    window.open(href, "_blank", "noopener,noreferrer");
  };

  return (
    <div
      className={joinClassNames("tiptapEditorContent", className)}
      onClick={handleClick}
    >
      {value ? (
        <div
          className={joinClassNames("tiptap", contentClassName)}
          dangerouslySetInnerHTML={{ __html: value }}
        />
      ) : (
        <div
          className={joinClassNames(
            "tiptap tiptapViewerEmpty",
            contentClassName,
          )}
        >
          {emptyText}
        </div>
      )}
    </div>
  );
}
