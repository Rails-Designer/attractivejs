import Debug from "../../debug.js";

class Template {
  constructor(templateId) {
    this.source = templateId ? document.getElementById(templateId) : null;

    if (templateId && !this.source) {
      Debug.warn(`Attract: template "#${templateId}" not found`);
    }
  }

  render({ with: data, target, targets: selector, position }) {
    const targetElements = this.#targets({ target, targets: selector });
    if (!targetElements.length) return [];

    if (position === "remove") {
      targetElements.forEach((element) => element.remove());

      return [];
    }

    if (!this.source) return [];

    const items = Array.isArray(data) ? data : [data];
    const results = [];

    targetElements.forEach((targetElement) => {
      items.forEach((item) =>
        results.push(
          this.#renderIn({
            target: targetElement,
            item,
            position
          })
        )
      );
    });

    return results;
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

  #renderIn({ target, item, position }) {
    const template = this.source.content.cloneNode(true).firstElementChild;

    this.#snapshot({ template, with: item });

    this.#insert({ template, target, at: position });

    return template;
  }

  #snapshot({ template, with: data }) {
    if (!data) return;

    for (const [key, value] of Object.entries(data)) {
      const elements = [];

      if (template.getAttribute("attract-field") === key) {
        elements.push(template);
      }

      elements.push(...template.querySelectorAll(`[attract-field="${key}"]`));

      for (const element of elements) {
        this.#setValue(element, value);
      }
    }
  }

  #setValue(element, value) {
    const tag = element.tagName;
    const type = (element.getAttribute("type") || "").toLowerCase();

    if (type === "checkbox" || type === "radio" || tag === "OPTION") {
      if (typeof value === "boolean") {
        if (tag === "OPTION") {
          element.selected = value;
        } else {
          element.checked = value;
        }
      } else {
        element.value = value ?? "";
      }

      return;
    }

    if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") {
      element.value = value ?? "";

      return;
    }

    element.textContent = value ?? "";
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
