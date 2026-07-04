import ActionBase from "./base";
import debounce from "./../helpers/debounce";

const debouncedClearingFeedback = debounce();

class Clipboard extends ActionBase {
  constructor(currentElement, options = {}) {
    super(currentElement, options);

    this.value = options.value;
  }

  async copy() {
    const textToCopy =
      this.value || (this.targets[0]?.value ?? this.targets[0]?.textContent);

    if (textToCopy === undefined) return;

    try {
      await navigator.clipboard.writeText(textToCopy);

      this.#setFeedback(true);
    } catch (error) {
      this.#setFeedback(false);
    }
  }

  // private

  #setFeedback(succeeded) {
    const delay = parseInt(this.currentElement.dataset.clipboardFeedback);

    this.targets.forEach((target) =>
      target.setAttribute(this.#attributeName, succeeded)
    );

    if (!delay) return;

    debouncedClearingFeedback(
      () =>
        this.targets.forEach((target) =>
          target.removeAttribute(this.#attributeName)
        ),
      delay
    );
  }

  get #attributeName() {
    return "data-copy-success";
  }
}

export const copy = Clipboard.actionFor("copy");

const actions = { copy };

export default actions;

export const clipboardAction = {
  name: "clipboard",
  actions
};
