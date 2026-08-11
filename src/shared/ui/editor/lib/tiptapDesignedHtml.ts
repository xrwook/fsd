import { Extension, mergeAttributes, Node } from "@tiptap/core";
import { Plugin } from "@tiptap/pm/state";

const BLOCK_CONTAINER_TAGS = [
  "article",
  "aside",
  "footer",
  "header",
  "main",
  "nav",
  "section",
] as const;

const INLINE_CONTAINER_TAGS = ["div"] as const;
const CONTAINER_TAGS = [...BLOCK_CONTAINER_TAGS, ...INLINE_CONTAINER_TAGS];
const CONTAINER_TAG_NAMES = new Set<string>(CONTAINER_TAGS);

const KNOWN_BLOCK_CHILD_TAGS = new Set([
  ...BLOCK_CONTAINER_TAGS,
  ...INLINE_CONTAINER_TAGS,
  "blockquote",
  "button",
  "figure",
  "h1",
  "h2",
  "h3",
  "h4",
  "h5",
  "h6",
  "hr",
  "ol",
  "p",
  "pre",
  "table",
  "ul",
]);

const SAFE_STYLE_NAME = /^(?:--[\w-]+|[a-z][\w-]*)$/i;
const UNSAFE_STYLE_VALUE =
  /(?:expression\s*\(|javascript\s*:|vbscript\s*:|data\s*:\s*text\/html|@import|\bbehavior\s*:|-moz-binding)/i;
const URL_STYLE_VALUE = /\burl\s*\(/i;
const SAFE_CLASS_NAME = /^[\w:-]+$/;
const SAFE_ID = /^[\w:.-]+$/;
const SAFE_ROLE = /^[a-z][\w-]*$/i;
const HTML_START_TAG_PATTERN =
  /^\s*(?:<!doctype\s+html\b|<([a-z][\w:-]*)\b[\s\S]*>)/i;
const PLAIN_TEXT_HTML_TAG_NAMES = new Set([
  ...BLOCK_CONTAINER_TAGS,
  ...INLINE_CONTAINER_TAGS,
  "blockquote",
  "button",
  "figure",
  "ol",
  "p",
  "table",
  "ul",
]);

const normalizeAttributeValue = (value: unknown) =>
  typeof value === "string" ? value.trim() : "";

const isDesignedHtmlText = (value: string) => {
  const match = value.match(HTML_START_TAG_PATTERN);
  if (!match) return false;
  if (!match[1]) return true;

  const tagName = match[1].toLowerCase();
  return PLAIN_TEXT_HTML_TAG_NAMES.has(tagName) || /^h[1-6]$/.test(tagName);
};

const sanitizeStyle = (value: unknown) => {
  const style = normalizeAttributeValue(value).replaceAll(
    /\/\*[\s\S]*?\*\//g,
    "",
  );
  if (!style) return null;

  const declarations = style
    .split(";")
    .map((declaration) => {
      const firstColonIndex = declaration.indexOf(":");
      if (firstColonIndex === -1) return "";

      const property = declaration.slice(0, firstColonIndex).trim();
      const propertyValue = declaration.slice(firstColonIndex + 1).trim();

      if (
        !property ||
        !propertyValue ||
        !SAFE_STYLE_NAME.test(property) ||
        UNSAFE_STYLE_VALUE.test(propertyValue) ||
        URL_STYLE_VALUE.test(propertyValue)
      ) {
        return "";
      }

      const normalizedValue =
        property.toLowerCase() === "border" &&
        propertyValue.toLowerCase() === "none"
          ? "0"
          : propertyValue;

      return `${property}: ${normalizedValue}`;
    })
    .filter(Boolean);

  return declarations.length > 0 ? declarations.join("; ") : null;
};

const sanitizeClass = (value: unknown) => {
  const className = normalizeAttributeValue(value);
  if (!className) return null;

  const safeClassName = className
    .split(/\s+/)
    .filter((name) => SAFE_CLASS_NAME.test(name))
    .join(" ");

  return safeClassName || null;
};

const sanitizeId = (value: unknown) => {
  const id = normalizeAttributeValue(value);
  return id && SAFE_ID.test(id) ? id : null;
};

const sanitizePlainAttribute = (value: unknown) => {
  const attributeValue = normalizeAttributeValue(value);
  return attributeValue || null;
};

const sanitizeRole = (value: unknown) => {
  const role = normalizeAttributeValue(value);
  return role && SAFE_ROLE.test(role) ? role : null;
};

const renderAttribute = (name: string, value: string | null) =>
  value ? { [name]: value } : {};

const normalizeContainerTagName = (value: unknown) => {
  const tagName = normalizeAttributeValue(value).toLowerCase();
  return CONTAINER_TAG_NAMES.has(tagName) ? tagName : "div";
};

const hasBlockElementChild = (element: HTMLElement) =>
  [...element.children].some((child) =>
    KNOWN_BLOCK_CHILD_TAGS.has(child.tagName.toLowerCase()),
  );

const sanitizeButtonType = (value: unknown) => {
  const type = normalizeAttributeValue(value).toLowerCase();
  return type === "submit" || type === "reset" ? type : "button";
};

const sanitizeUrl = (value: unknown) => {
  let url = normalizeAttributeValue(value);
  if (!url) return null;

  const markdownLink = url.match(/^\[([^\]]+)]\(([^)]+)\)$/);
  if (markdownLink?.[2]) {
    url = markdownLink[2].trim();
  }

  const anchorHref = url.match(/<a\b[^>]*\bhref=(["'])(.*?)\1/i);
  if (anchorHref?.[2]) {
    url = anchorHref[2].trim();
  }

  try {
    const baseUrl =
      typeof window === "undefined" || window.location.origin === "null"
        ? "http://localhost"
        : window.location.origin;
    const parsedUrl = new URL(url, baseUrl);

    return ["http:", "https:", "mailto:", "tel:"].includes(parsedUrl.protocol)
      ? url
      : null;
  } catch {
    return null;
  }
};

const extractLocationHref = (value: unknown) => {
  const handler = normalizeAttributeValue(value);
  const match =
    handler.match(/(?:window\.)?location(?:\.href)?\s*=\s*(['"])(.*?)\1/i) ??
    handler.match(/(?:window\.)?location\.assign\(\s*(['"])(.*?)\1\s*\)/i);

  return sanitizeUrl(match?.[2]);
};

const getClipboardHtmlFragment = (value: string) => {
  const startMarker = "<!--StartFragment-->";
  const endMarker = "<!--EndFragment-->";
  const startIndex = value.indexOf(startMarker);
  const endIndex = value.indexOf(endMarker);

  if (startIndex !== -1 && endIndex !== -1 && startIndex < endIndex) {
    return value.slice(startIndex + startMarker.length, endIndex).trim();
  }

  return value.trim();
};

const getPlainProseMirrorParagraphText = (
  htmlText: string | undefined,
  plainText: string | undefined,
) => {
  const plainValue = plainText?.trim();
  if (!htmlText || !plainValue || typeof document === "undefined") return null;

  const fragment = getClipboardHtmlFragment(htmlText);
  if (!fragment.includes("data-pm-slice")) return null;

  const template = document.createElement("template");
  template.innerHTML = fragment;

  const nodes = [...template.content.childNodes].filter((node) => {
    const textContent = node.textContent?.trim();
    return node.nodeType !== 8 && (node.nodeType !== 3 || !!textContent);
  });

  if (nodes.length !== 1) return null;

  const [node] = nodes;
  if (!(node instanceof HTMLElement) || node.tagName.toLowerCase() !== "p") {
    return null;
  }

  if (node.textContent?.trim() !== plainValue || node.children.length > 0) {
    return null;
  }

  return plainValue;
};

export const DesignedHtmlAttributes = Extension.create({
  name: "designedHtmlAttributes",

  addGlobalAttributes() {
    return [
      {
        types: "*",
        attributes: {
          class: {
            default: null,
            parseHTML: (element) =>
              sanitizeClass(element.getAttribute("class")),
            renderHTML: (attributes) =>
              renderAttribute("class", sanitizeClass(attributes.class)),
          },
          id: {
            default: null,
            parseHTML: (element) => sanitizeId(element.getAttribute("id")),
            renderHTML: (attributes) =>
              renderAttribute("id", sanitizeId(attributes.id)),
          },
          role: {
            default: null,
            parseHTML: (element) => sanitizeRole(element.getAttribute("role")),
            renderHTML: (attributes) =>
              renderAttribute("role", sanitizeRole(attributes.role)),
          },
          style: {
            default: null,
            parseHTML: (element) =>
              sanitizeStyle(element.getAttribute("style")),
            renderHTML: (attributes) =>
              renderAttribute("style", sanitizeStyle(attributes.style)),
          },
          title: {
            default: null,
            parseHTML: (element) =>
              sanitizePlainAttribute(element.getAttribute("title")),
            renderHTML: (attributes) =>
              renderAttribute(
                "title",
                sanitizePlainAttribute(attributes.title),
              ),
          },
        },
      },
    ];
  },
});

export const DesignedHtmlBlock = Node.create({
  name: "designedHtmlBlock",
  group: "block",
  content: "block*",
  defining: true,

  addAttributes() {
    return {
      tagName: {
        default: "div",
        rendered: false,
        parseHTML: (element) => normalizeContainerTagName(element.tagName),
      },
    };
  },

  parseHTML() {
    return CONTAINER_TAGS.map((tag) => ({
      tag,
      getAttrs: (element) => {
        if (tag === "div" && !hasBlockElementChild(element)) {
          return false;
        }

        return { tagName: tag };
      },
    }));
  },

  renderHTML({ node, HTMLAttributes }) {
    return [
      normalizeContainerTagName(node.attrs.tagName),
      mergeAttributes(HTMLAttributes),
      0,
    ];
  },
});

export const DesignedHtmlInlineBlock = Node.create({
  name: "designedHtmlInlineBlock",
  priority: 110,
  group: "block",
  content: "inline*",
  marks: "_",
  defining: true,

  addAttributes() {
    return {
      tagName: {
        default: "div",
        rendered: false,
        parseHTML: (element) => normalizeContainerTagName(element.tagName),
      },
    };
  },

  parseHTML() {
    return INLINE_CONTAINER_TAGS.map((tag) => ({
      tag,
      getAttrs: (element) =>
        hasBlockElementChild(element) ? false : { tagName: tag },
    }));
  },

  renderHTML({ node, HTMLAttributes }) {
    return [
      normalizeContainerTagName(node.attrs.tagName),
      mergeAttributes(HTMLAttributes),
      0,
    ];
  },
});

export const DesignedHtmlButton = Node.create({
  name: "designedHtmlButton",
  priority: 120,
  group: "block",
  content: "inline*",
  marks: "_",
  defining: true,

  addAttributes() {
    return {
      dataHref: {
        default: null,
        parseHTML: (element) =>
          sanitizeUrl(element.dataset.href) ??
          extractLocationHref(element.getAttribute("onclick")),
        renderHTML: (attributes) =>
          renderAttribute("data-href", sanitizeUrl(attributes.dataHref)),
      },
      type: {
        default: "button",
        parseHTML: (element) =>
          sanitizeButtonType(element.getAttribute("type")),
        renderHTML: (attributes) => ({
          type: sanitizeButtonType(attributes.type),
        }),
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: "button",
        getAttrs: () => ({}),
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return ["button", mergeAttributes(HTMLAttributes), 0];
  },
});

export const DesignedHtmlPlainTextPaste = Extension.create({
  name: "designedHtmlPlainTextPaste",

  addProseMirrorPlugins() {
    return [
      new Plugin({
        props: {
          handlePaste: (_view, event) => {
            const plainText = event.clipboardData?.getData("text/plain");
            const htmlText = plainText?.trim();
            const plainParagraphText = getPlainProseMirrorParagraphText(
              event.clipboardData?.getData("text/html"),
              plainText,
            );

            if (plainParagraphText) {
              event.preventDefault();
              this.editor.commands.insertContent(plainParagraphText);
              return true;
            }

            if (!htmlText || !isDesignedHtmlText(htmlText)) {
              return false;
            }

            event.preventDefault();
            this.editor.commands.insertContent(htmlText);
            return true;
          },
        },
      }),
    ];
  },
});

export const DesignedHtmlExtensions = [
  DesignedHtmlAttributes,
  DesignedHtmlBlock,
  DesignedHtmlInlineBlock,
  DesignedHtmlButton,
  DesignedHtmlPlainTextPaste,
];
