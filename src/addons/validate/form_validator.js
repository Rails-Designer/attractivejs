const MESSAGE_KEYS = [
  "valueMissing",
  "tooShort",
  "tooLong",
  "typeMismatch",
  "patternMismatch",
  "rangeUnderflow",
  "rangeOverflow",
  "stepMismatch",
  "badInput"
];

class FormValidator {
  #form;
  #errorLabels = new WeakMap();

  constructor(form) {
    this.#form = form;
  }

  setup() {
    const controller = new AbortController();

    this.#form.addEventListener("input", (event) => this.#clearError(event), {
      signal: controller.signal
    });
    this.#form.addEventListener("change", (event) => this.#checkField(event), {
      signal: controller.signal
    });
    this.#form.addEventListener("submit", (event) => this.#checkAll(event), {
      signal: controller.signal
    });
    this.#form.addEventListener("reset", () => this.#clearAll(), {
      signal: controller.signal
    });

    for (const input of this.#inputs) {
      input.addEventListener("invalid", (event) => this.#fieldError(event), {
        signal: controller.signal
      });
    }

    return () => controller.abort();
  }

  #clearError(event) {
    this.#hideError({ for: event.target });
  }

  #checkField(event) {
    const input = event.target;

    if (input.validity.valid) {
      this.#hideError({ for: input });
    } else {
      this.#showError({ for: input });
    }
  }

  #fieldError(event) {
    event.preventDefault();

    this.#showError({ for: event.target });
  }

  #checkAll(event) {
    let allValid = true;

    for (const input of this.#inputs) {
      if (input.validity.valid) {
        continue;
      }

      this.#showError({ for: input });

      allValid = false;
    }

    if (!allValid) {
      event.preventDefault();
    }
  }

  #clearAll() {
    for (const input of this.#inputs) {
      this.#hideError({ for: input });
    }
  }

  #hideError({ for: input }) {
    const label = this.#errorLabels.get(input);

    if (!label) {
      return;
    }

    label.textContent = "";
    label.style.display = "none";
  }

  #showError({ for: input }) {
    const label = this.#errorLabel({ for: input });

    label.textContent = this.#message({ for: input });
    label.style.display = "block";
  }

  #errorLabel({ for: input }) {
    let label = this.#errorLabels.get(input);

    if (label) {
      return label;
    }

    const id = this.#id({ for: input });

    label = document.createElement("span");
    label.className = "error-label";
    label.id = id;
    label.style.display = "none";

    input.setAttribute("aria-describedby", id);
    input.parentNode.insertBefore(label, input.nextSibling);

    this.#errorLabels.set(input, label);

    return label;
  }

  #id({ for: input }) {
    return `${input.id || input.name || "field"}-error`;
  }

  #message({ for: input }) {
    const inputMessages = this.#messages({ for: input });
    const formMessages = this.#messages({ for: this.#form });

    for (const key of MESSAGE_KEYS) {
      if (!input.validity[key]) {
        continue;
      }

      if (inputMessages?.[key]) {
        return inputMessages[key];
      }

      if (formMessages?.[key]) {
        return formMessages[key];
      }

      break;
    }

    return input.validationMessage;
  }

  #messages({ for: element }) {
    const messages = element.dataset.validateMessages;

    if (!messages) {
      return null;
    }

    try {
      return JSON.parse(messages);
    } catch {
      return null;
    }
  }

  get #inputs() {
    return this.#form.querySelectorAll("input, select, textarea");
  }
}

export { FormValidator };
