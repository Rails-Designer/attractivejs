import { store } from "../reactive/store.js";
import Debug from "../../debug.js";

class Template {
  constructor(templateId) {
    this.source = templateId ? document.getElementById(templateId) : null;

    if (templateId && !this.source) {
      Debug.warn(`Attract: template "#${templateId}" not found`);
    }
  }

  render({ with: data, target, targets: selector, position, remainReactive }) {
    const targetElements = this.#targets({ target, targets: selector });
    if (!targetElements.length) return;

    if (position === "remove") {
      targetElements.forEach((element) => element.remove());

      return;
    }

    if (!this.source) return;

    const items = Array.isArray(data) ? data : [data];
    targetElements.forEach((targetElement) => {
      items.forEach((item) =>
        this.#renderIn({
          target: targetElement,
          item,
          position,
          remainReactive
        })
      );
    });
  }

  // private

  #targets({ target, targets: selector }) {
    if (selector) return Array.from(document.querySelectorAll(selector));
    if (target) {
      const element = document.getElementById(target);

      return element ? [element] : [];
    }

    return [];
  }

  #renderIn({ target, item, position, remainReactive }) {
    this.#setStore({ with: item });
    const template = this.source.content.cloneNode(true).firstElementChild;

    if (!remainReactive) {
      this.#snapshot({ template, with: item });
    }

    this.#insert({ template, target, at: position });
  }

  #setStore({ with: data }) {
    if (!data) return;

    for (const [key, value] of Object.entries(data)) {
      store.set(key, { with: value });
    }
  }

  #snapshot({ template, with: data }) {
    if (!data) return;

    for (const [key, value] of Object.entries(data)) {
      const clonedTemplate =
        template.getAttribute("@text") === key
          ? template
          : template.querySelector(`[\\@text="${key}"]`);

      if (clonedTemplate) {
        clonedTemplate.textContent = value == null ? "" : value;
      }
    }

    template.removeAttribute("@text");
    for (const child of template.querySelectorAll("[\\@text]")) {
      child.removeAttribute("@text");
    }
  }

  #insert({ template, target, at: position }) {
    if (position === "append") target.append(template);
    else if (position === "prepend") target.prepend(template);
    else if (position === "replace") target.replaceWith(template);
    else if (position === "before") target.before(template);
    else if (position === "after") target.after(template);
  }
}

export { Template };
