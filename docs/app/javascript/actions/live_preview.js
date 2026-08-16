import { Action } from "attractivejs";

const VOID_ELEMENTS = new Set([
  "br", "hr", "img", "input", "link", "meta",
  "area", "base", "col", "embed", "source", "track", "wbr"
]);

const TAG_COLOR = 'style="color: #f68482"';
const ATTRIBUTE_COLOR = 'style="color: #ffe1df"';
const STRING_COLOR = 'style="color: #ffe1df"';
const PUNCTUATION_COLOR = 'style="color: #67787c"';
const TEXT_COLOR = 'style="color: #fff9f9"';

const TAG_PATTERN = /(&lt;)(\/?)([\w-]+)((?:\s[^&]*?)?)(\s*)(\/?)(&gt;)/g;
const COMMENT_PATTERN = /(&lt;!--[\s\S]*?--&gt;)/g;
const ATTRIBUTE_PATTERN = /(\s)(@[\w-]+|[\w-]+)(?:=(".*?"))?/g;

export default class LivePreview extends Action {
  #observer = null;
  #codeContainer = null;
  #exampleContainer = null;
  #previousHTML = "";
  #animationRequest = null;
  #serializer = new Serializer();
  #highlighter = new Highlighter();

  run() {
    this.#exampleContainer = this.targets[0];
    if (!this.#exampleContainer) return;

    this.#codeContainer = this.element.querySelector(".code");
    if (!this.#codeContainer) return;

    this.#previousHTML = this.#serializer.format(this.#exampleContainer);

    this.#observer = new MutationObserver(() => {
      cancelAnimationFrame(this.#animationRequest);

      this.#animationRequest = requestAnimationFrame(() => {
        const serializedHtml = this.#serializer.format(this.#exampleContainer);

        if (serializedHtml !== this.#previousHTML) this.#render(serializedHtml);
      });
    });

    this.#observer.observe(this.#exampleContainer, {
      childList: true,
      subtree: true,
      attributes: true,
      characterData: true
    });
  }

  #lineStatus(lineIndex, lines, previousLines) {
    const lineWasAdded = lineIndex >= previousLines.length;
    const lineWasRemoved = lineIndex >= lines.length;

    if (lineWasAdded) return "added";
    if (lineWasRemoved) return "removed";
    if (lines[lineIndex] !== previousLines[lineIndex]) return "modified";

    return "";
  }

  #render(html) {
    const lines = html.split("\n");
    const previousLines = this.#previousHTML ? this.#previousHTML.split("\n") : [];
    const maximumLines = Math.max(lines.length, previousLines.length);
    const renderedLines = [];
    const changedLines = [];

    for (let lineIndex = 0; lineIndex < maximumLines; lineIndex++) {
      const status = this.#lineStatus(lineIndex, lines, previousLines);

      if (status) changedLines.push({ lineIndex, status });

      const content = lineIndex < lines.length ? lines[lineIndex] : previousLines[lineIndex];
      renderedLines.push(
        `<span class="live-line">${this.#highlighter.tokenize(this.#encodeHTML(content))}\n</span>`
      );
    }

    this.#codeContainer.innerHTML = `<pre><code>${renderedLines.join("")}</code></pre>`;
    this.#previousHTML = html;

    if (changedLines.length) {
      requestAnimationFrame(() => {
        const spans = this.#codeContainer.querySelectorAll(".live-line");

        changedLines.forEach(({ lineIndex, status }) => {
          if (spans[lineIndex]) spans[lineIndex].classList.add(status);
        });
      });
    }
  }

  #encodeHTML(string) {
    const element = document.createElement("div");
    element.textContent = string;

    return element.innerHTML;
  }
}

class Serializer {
  format(container) {
    let html = "";

    container.childNodes.forEach((node) => {
      const serializedNode = this.#serialize(node, 0);

      if (serializedNode) html += serializedNode;
    });

    return html.trim();
  }

  #serialize(node, depth) {
    if (node.nodeType === Node.TEXT_NODE) return this.#text(node, depth);
    if (node.nodeType === Node.ELEMENT_NODE) return this.#element(node, depth);

    return "";
  }

  #text(node, depth) {
    const indent = "  ".repeat(depth);
    const text = node.textContent.replace(/\s+/g, " ").trim();

    if (text) return indent + this.#encodeHTML(text) + "\n";
    if (/\n\s*\n/.test(node.textContent)) return "\n";

    return "";
  }

  #element(node, depth) {
    const indent = "  ".repeat(depth);
    const tag = node.tagName.toLowerCase();
    const attributes = this.#attributes(node);
    const attributeBlock = attributes ? " " + attributes : "";

    if (VOID_ELEMENTS.has(tag)) return `${indent}<${tag}${attributeBlock}>\n`;

    const children = Array.from(node.childNodes);
    const containsElementChildren = children.some((child) => child.nodeType === Node.ELEMENT_NODE);

    if (!containsElementChildren) return this.#compactElement(tag, attributeBlock, children, indent);

    return this.#nestedElement(tag, attributeBlock, children, depth);
  }

  #compactElement(tag, attributeBlock, children, indent) {
    const text = children
      .filter((child) => child.nodeType === Node.TEXT_NODE)
      .map((child) => {
        const value = child.textContent.replace(/\s+/g, " ").trim();
        return value ? this.#encodeHTML(value) : "";
      })
      .join("");

    return text
      ? `${indent}<${tag}${attributeBlock}>${text}</${tag}>\n`
      : `${indent}<${tag}${attributeBlock}></${tag}>\n`;
  }

  #nestedElement(tag, attributeBlock, children, depth) {
    const indent = "  ".repeat(depth);
    const serialized = children
      .map((child) => this.#serialize(child, depth + 1))
      .join("");

    if (!serialized.trim()) return `${indent}<${tag}${attributeBlock}></${tag}>\n`;

    return `${indent}<${tag}${attributeBlock}>\n${serialized}${indent}</${tag}>\n`;
  }

  #attributes(element) {
    return Array.from(element.attributes)
      .filter((attribute) => !attribute.name.startsWith("data-live"))
      .map((attribute) =>
        attribute.value === ""
          ? attribute.name
          : `${attribute.name}="${this.#encodeHTML(attribute.value)}"`
      )
      .join(" ");
  }

  #encodeHTML(string) {
    const element = document.createElement("div");
    element.textContent = string;

    return element.innerHTML;
  }
}

class Highlighter {
  tokenize(html) {
    const afterComments = html.replace(COMMENT_PATTERN, (match) =>
      `<span style="color: #67787c; font-style: italic">${match}</span>`
    );

    return afterComments.replace(TAG_PATTERN, (match, open, slash, name, tagBody, space, selfClose, close) => {
      let tag = `${this.#punctuationSpan(open)}${slash ? this.#punctuationSpan(slash) : ""}<span ${TAG_COLOR}>${name}</span>`;

      if (tagBody) {
        tag += tagBody.replace(ATTRIBUTE_PATTERN, (match, whitespace, attributeName, value) =>
          this.#attribute(whitespace, attributeName, value)
        );
      }

      if (selfClose) tag += this.#punctuationSpan(selfClose);
      tag += this.#punctuationSpan(close);

      return tag;
    });
  }

  #attribute(whitespace, attributeName, value) {
    if (attributeName.startsWith("@")) {
      if (value !== undefined) {
        return `${whitespace}<span ${TEXT_COLOR}>${attributeName}=${value}</span>`;
      }

      return `${whitespace}<span ${TEXT_COLOR}>${attributeName}</span>`;
    }

    if (value !== undefined) {
      const content = value.slice(1, -1);

      return `${whitespace}<span ${ATTRIBUTE_COLOR}>${attributeName}</span><span ${PUNCTUATION_COLOR}>=</span><span ${PUNCTUATION_COLOR}>"</span><span ${STRING_COLOR}>${content}</span><span ${PUNCTUATION_COLOR}>"</span>`;
    }

    return `${whitespace}<span ${ATTRIBUTE_COLOR}>${attributeName}</span>`;
  }

  #punctuationSpan(character) {
    return `<span ${PUNCTUATION_COLOR}>${character}</span>`;
  }
}
