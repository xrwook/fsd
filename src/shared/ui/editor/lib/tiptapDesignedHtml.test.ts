// @vitest-environment jsdom

import { describe, expect, it } from "vitest";

import { sanitizeDesignedHtml } from "./tiptapDesignedHtml";

const parse = (html: string) => {
  const container = document.createElement("div");
  container.innerHTML = html;
  return container;
};

describe("게시글 HTML 정제", () => {
  it("보고된 img onerror 공격을 제거하고 본문과 이미지를 유지한다", () => {
    expect(
      sanitizeDesignedHtml('<img onerror=prompt("XSS TEST") src="x"> test'),
    ).toBe('<img src="x"> test');
  });

  it.each([
    '<script>alert(1)</script><p>본문</p>',
    '<img src="x" ONERROR="alert(1)" onload="alert(1)">',
    '<iframe srcdoc="<script>alert(1)</script>"></iframe>',
    '<svg><a xlink:href="javascript:alert(1)">click</a></svg>',
    '<math><mtext><table><mglyph><style><!--</style><img title="--><img src=x onerror=alert(1)>">',
    '<form><input name="innerHTML"><button formaction="javascript:alert(1)">click</button></form>',
    '<object data="data:text/html,<script>alert(1)</script>"></object>',
    '<template><img src=x onerror=alert(1)></template>',
    '<style>body { display:none }</style><link rel="stylesheet" href="https://example.com/x.css">',
    '<custom-element onclick="alert(1)">본문</custom-element>',
  ])("위험한 요소·속성을 제거하고 재파싱 후에도 안전하다: %s", (payload) => {
    const clean = sanitizeDesignedHtml(payload);
    const body = parse(clean);
    expect(body.querySelector(
      "script, iframe, svg, math, form, input, object, template, style, link, custom-element",
    )).toBeNull();
    for (const element of body.querySelectorAll("*")) {
      expect(element.getAttributeNames().some((name) =>
        name.startsWith("on") || ["srcdoc", "formaction"].includes(name),
      )).toBe(false);
    }
    expect(sanitizeDesignedHtml(body.innerHTML)).toBe(clean);
  });

  it.each([
    "javascript:alert(1)",
    "jav&#x61;script:alert(1)",
    "java&#x09;script:alert(1)",
    "java&#x0a;script:alert(1)",
    "vbscript:msgbox(1)",
    "data:text/html,<script>alert(1)</script>",
    "data:image/svg+xml,<svg onload=alert(1)></svg>",
  ])("링크·이미지·버튼 URL의 실행 가능한 스킴을 제거한다: %s", (url) => {
    const body = parse(sanitizeDesignedHtml(
      `<a href="${url}">link</a><img src="${url}"><button data-href="${url}">button</button>`,
    ));
    expect(body.querySelector("[href], [src], [data-href]")).toBeNull();
  });

  it("정상 문서의 서식·표·이미지 식별자·안전한 링크를 유지한다", () => {
    const body = parse(sanitizeDesignedHtml(`
      <section class="notice" id="intro" style="padding: 16px; border: none">
        <h2>제목</h2><p style="text-align: center"><strong>강조</strong>
        <span style="font-family: Pretendard; font-size: 18px; color: #123456">서식</span>
        <mark data-color="#ffff00" style="background-color: #ffff00">형광펜</mark></p>
        <ol start="3"><li>항목</li></ol>
        <table><colgroup><col style="width: 120px"></colgroup><tbody><tr>
          <th colspan="2" colwidth="120,120">셀</th><td rowspan="2">값</td>
        </tr></tbody></table>
        <img src="https://example.com/image.png" alt="설명" data-file-detail-id="file-1" width="200">
        <a href="/notice/1" target="_blank" rel="opener">공지</a>
        <a href="mailto:help@example.com">메일</a><a href="tel:1234">전화</a>
        <button type="submit" data-href="https://example.com" aria-label="자세히">이동</button>
      </section>`));
    expect(body.querySelector("section")?.getAttribute("style")).toBe("padding: 16px; border: 0");
    expect(body.querySelector("span")?.getAttribute("style")).toContain("font-size: 18px");
    expect(body.querySelector("mark")?.dataset.color).toBe("#ffff00");
    expect(body.querySelector("ol")?.getAttribute("start")).toBe("3");
    expect(body.querySelector("th")?.getAttribute("colwidth")).toBe("120,120");
    expect(body.querySelector("img")?.dataset.fileDetailId).toBe("file-1");
    expect(body.querySelector("a")?.getAttribute("rel")).toBe("noopener noreferrer nofollow");
    expect(body.querySelector("button")?.getAttribute("type")).toBe("button");
    expect(body.querySelector("button")?.dataset.href).toBe("https://example.com");
    expect(body.querySelectorAll("a[href]")).toHaveLength(3);
  });

  it("CSS URL·이스케이프·레거시 실행 구문을 제거한다", () => {
    const body = parse(sanitizeDesignedHtml(String.raw`<p style="color: red; background: url(https://example.com); background-image: u\72l(https://example.com); width: expression(alert(1)); behavior: test; --payload: url(x)">본문</p>`));
    expect(body.querySelector("p")?.getAttribute("style")).toBe("color: red");
  });

  it("실행 구문이 포함된 코드 예제는 텍스트로 유지한다", () => {
    const body = parse(sanitizeDesignedHtml('<pre><code>&lt;img src=x onerror=alert(1)&gt;</code></pre>'));
    expect(body.querySelector("code")?.textContent).toBe("<img src=x onerror=alert(1)>");
    expect(body.querySelector("img")).toBeNull();
  });
});
