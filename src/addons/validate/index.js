import { FormValidator } from "./form_validator.js";

const forms = new WeakMap();

export function validate({ instance }) {
  instance.onElementAdded((element) => {
    if (element.tagName !== "FORM") return;
    if (element.hasAttribute("novalidate")) return;
    if (!element.hasAttribute("@validate")) return;

    if (forms.has(element)) return;

    const validator = new FormValidator(element);

    forms.set(element, validator.setup());
  });

  instance.onElementRemoved((element) => {
    const cleanup = forms.get(element);

    if (cleanup) {
      cleanup();

      forms.delete(element);
    }
  });
}
