// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { useState } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";

import TiptapEditor from "./TiptapEditor";
import TiptapViewer from "./TiptapViewer";

vi.mock("../api/editor.service", () => ({ uploadEditorImage: vi.fn() }));
vi.mock("./_EditorToolbar", () => ({
  EditorToolbar: ({ onToggleHtmlSource }: { onToggleHtmlSource: () => void }) => (
    <button type="button" onClick={onToggleHtmlSource}>모드 전환</button>
  ),
}));

afterEach(cleanup);

const attack = '<img onerror=prompt("XSS TEST") src="x"> test';

function PostForm({ onSave }: { onSave: (html: string) => void }) {
  const [content, setContent] = useState("");
  return (
    <form onSubmit={(event) => { event.preventDefault(); onSave(content); }}>
      <TiptapEditor referenceType="NOTICE" value={content} onChange={setContent} />
      <button type="submit">저장</button>
    </form>
  );
}

describe("에디터 Stored XSS 회귀", () => {
  it("소스 모드에서 바로 저장해도 정제한 HTML만 폼으로 전달한다", () => {
    const onSave = vi.fn();
    render(<PostForm onSave={onSave} />);
    fireEvent.click(screen.getByRole("button", { name: "모드 전환" }));
    const source = screen.getByRole("textbox", { name: "HTML 소스" });
    fireEvent.change(source, { target: { value: attack } });
    expect((source as HTMLTextAreaElement).value).toBe(attack);
    fireEvent.click(screen.getByRole("button", { name: "저장" }));
    expect(onSave).toHaveBeenLastCalledWith('<img src="x"> test');

    fireEvent.click(screen.getByRole("button", { name: "모드 전환" }));
    expect(document.querySelector(".tiptap [onerror]")).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: "저장" }));
    expect(onSave.mock.lastCall?.[0]).not.toContain("onerror");
  });

  it("소스 모드 붙여넣기 후 전환 없이 저장해도 안전하다", () => {
    const onSave = vi.fn();
    render(<PostForm onSave={onSave} />);
    fireEvent.click(screen.getByRole("button", { name: "모드 전환" }));
    const source = screen.getByRole("textbox", { name: "HTML 소스" }) as HTMLTextAreaElement;
    source.select();
    fireEvent.paste(source, {
      clipboardData: { getData: () => attack },
    });
    fireEvent.click(screen.getByRole("button", { name: "저장" }));
    expect(onSave).toHaveBeenLastCalledWith('<img src="x"> test');
  });

  it("기존 저장 값과 나중에 불러온 값도 정제해 폼에 돌려준다", async () => {
    const onChange = vi.fn();
    const { container, rerender } = render(
      <TiptapEditor referenceType="NOTICE" value={attack} onChange={onChange} />,
    );
    await waitFor(() => expect(onChange).toHaveBeenCalledWith('<img src="x"> test'));
    expect(container.querySelector("[onerror]")).toBeNull();
    rerender(<TiptapEditor referenceType="NOTICE" value={'<p onclick="alert(1)">변경</p>'} onChange={onChange} />);
    await waitFor(() => expect(onChange).toHaveBeenLastCalledWith("<p>변경</p>"));
    expect(container.querySelector("[onclick]")).toBeNull();
  });

  it("일반 편집기에 HTML 텍스트를 붙여넣어도 정제한다", () => {
    const onChange = vi.fn();
    const { container } = render(<TiptapEditor referenceType="NOTICE" onChange={onChange} />);
    const editable = container.querySelector('[contenteditable="true"]')!;
    fireEvent.paste(editable, {
      clipboardData: {
        files: [],
        getData: (type: string) => type === "text/plain" ? `<p>${attack}</p>` : "",
      },
    });
    expect(onChange).toHaveBeenCalled();
    expect(onChange.mock.lastCall?.[0]).not.toContain("onerror");
    expect(container.querySelector("img")?.getAttribute("src")).toBe("x");
  });

  it("뷰어는 이미 저장된 공격과 위험한 버튼 링크를 제거한다", () => {
    const onHrefClick = vi.fn();
    const { container } = render(<TiptapViewer
      value={`${attack}<button data-href="javascript:alert(1)">위험</button><button data-href="/notice">공지</button>`}
      onHrefClick={onHrefClick}
    />);
    expect(container.querySelector("[onerror]")).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: "위험" }));
    expect(onHrefClick).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole("button", { name: "공지" }));
    expect(onHrefClick).toHaveBeenCalledWith("/notice");
  });
});
