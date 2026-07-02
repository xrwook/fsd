import Popover from "@mui/material/Popover";
import type { Editor } from "@tiptap/react";
import {
  type FormEvent,
  type MouseEvent,
  useEffect,
  useId,
  useRef,
  useState,
} from "react";

import { EditorIcon } from "./_EditorIcon";

type LinkPopoverProps = {
  disabled?: boolean;
  editor: Editor;
};

const normalizeLink = (url: string) => {
  const trimmedUrl = url.trim();

  if (/^(https?:\/\/|mailto:|tel:|\/|#)/i.test(trimmedUrl)) {
    return trimmedUrl;
  }

  return `https://${trimmedUrl}`;
};

const getSafeExternalUrl = (url: string) => {
  try {
    const parsedUrl = new URL(normalizeLink(url), window.location.href);

    if (["http:", "https:", "mailto:", "tel:"].includes(parsedUrl.protocol)) {
      return parsedUrl.href;
    }
  } catch {
    return null;
  }

  return null;
};

export const LinkPopover = ({ disabled = false, editor }: LinkPopoverProps) => {
  const [anchorElement, setAnchorElement] = useState<HTMLButtonElement | null>(
    null,
  );
  const [url, setUrl] = useState("");
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const inputId = useId();
  const errorId = `${inputId}-error`;
  const isOpen = Boolean(anchorElement);
  const isActive = editor.isActive("link");
  const isDisabled = disabled || !editor.isEditable;

  useEffect(() => {
    if (!isOpen) return;

    const frameId = window.requestAnimationFrame(() => {
      inputRef.current?.focus();
      inputRef.current?.select();
    });

    return () => window.cancelAnimationFrame(frameId);
  }, [isOpen]);

  useEffect(() => {
    if (isDisabled) {
      setAnchorElement(null);
    }
  }, [isDisabled]);

  const closePopover = () => {
    setAnchorElement(null);
    setError("");
  };

  const openPopover = (event: MouseEvent<HTMLButtonElement>) => {
    const currentUrl = editor.getAttributes("link").href;

    setUrl(typeof currentUrl === "string" ? currentUrl : "");
    setError("");
    setAnchorElement(event.currentTarget);
  };

  const applyLink = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!url.trim()) {
      setError("링크 URL을 입력하세요.");
      return;
    }

    const href = normalizeLink(url);
    const isCurrentLink = editor.isActive("link");
    const isEmptySelection = editor.state.selection.empty;
    let chain = editor
      .chain()
      .focus()
      .extendMarkRange("link")
      .setLink({ href });

    if (isEmptySelection && !isCurrentLink) {
      chain = chain.insertContent({ type: "text", text: href });
    }

    if (!chain.run()) {
      setError("사용할 수 없는 링크 URL입니다.");
      return;
    }

    closePopover();
  };

  const removeLink = () => {
    editor
      .chain()
      .focus()
      .extendMarkRange("link")
      .unsetLink()
      .setMeta("preventAutolink", true)
      .run();
    closePopover();
  };

  const openLink = () => {
    const safeUrl = getSafeExternalUrl(url);

    if (!safeUrl) {
      setError("사용할 수 없는 링크 URL입니다.");
      return;
    }

    window.open(safeUrl, "_blank", "noopener,noreferrer");
  };

  return (
    <>
      <button
        type="button"
        aria-label="링크 설정"
        aria-pressed={isActive}
        className={`tiptap-toolbar__button ${isActive ? "is-active" : ""}`}
        disabled={isDisabled}
        title="링크 설정"
        onClick={openPopover}
      >
        <EditorIcon name="link" />
      </button>

      <Popover
        anchorEl={anchorElement}
        anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
        open={isOpen}
        slotProps={{
          paper: {
            className: "tiptap-link-popover",
          },
        }}
        transformOrigin={{ vertical: "top", horizontal: "left" }}
        onClose={closePopover}
      >
        <form className="tiptap-link-popover__form" onSubmit={applyLink}>
          <label className="tiptap-link-popover__label" htmlFor={inputId}>
            링크 URL
          </label>
          <div className="tiptap-link-popover__input-row">
            <input
              ref={inputRef}
              id={inputId}
              aria-describedby={error ? errorId : undefined}
              aria-invalid={Boolean(error)}
              className="tiptap-link-popover__input"
              inputMode="url"
              placeholder="https://example.com"
              type="text"
              value={url}
              onChange={(event) => {
                setUrl(event.target.value);
                setError("");
              }}
            />
            <button
              className="tiptap-link-popover__button is-primary"
              type="submit"
            >
              적용
            </button>
          </div>

          {error && (
            <p id={errorId} className="tiptap-link-popover__error" role="alert">
              {error}
            </p>
          )}

          <div className="tiptap-link-popover__actions">
            <button
              className="tiptap-link-popover__button"
              disabled={!url}
              type="button"
              onClick={openLink}
            >
              새 창에서 열기
            </button>
            <button
              className="tiptap-link-popover__button is-danger"
              disabled={!isActive}
              type="button"
              onClick={removeLink}
            >
              링크 제거
            </button>
          </div>
        </form>
      </Popover>
    </>
  );
};
