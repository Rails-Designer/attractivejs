import ActionBase from "./base";
import debounce from "./../helpers/debounce";

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
    const duration = this.currentElement.dataset.copyDuration;

    this.targets.forEach((target) =>
      target.setAttribute(this.#attributeName, succeeded)
    );

    if (!duration) return;

    debounce(
      () =>
        this.targets.forEach((target) =>
          target.removeAttribute(this.#attributeName)
        ),
      parseInt(duration)
    );
  }

  get #attributeName() {
    return "data-copy-success";
  }
}

export const action =
  (method) =>
  (element, options = {}) => {
    const instance = new Clipboard(element, options);

    return instance[method]();
  };

export default {
  copy: action("copy")
};
