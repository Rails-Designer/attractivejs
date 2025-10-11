import ActionBase from "./base";
import debounce from "./../helpers/debounce";

class Clipboard extends ActionBase {
  constructor(currentElement, options = {}) {
    super(currentElement, options);

    this.value = options.value;

    const duration = currentElement.dataset.copyDuration;
    this.duration = duration ? parseInt(duration) : 2000;
  }

  async copy() {
    const textToCopy = this.value || (this.targets[0]?.value ?? this.targets[0]?.textContent);

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
    const attributeValue = String(succeeded);

    this.targets.forEach(target => target.setAttribute(this.#attributeName, attributeValue));

    debounce(() => {
      this.targets.forEach(target => target.removeAttribute(this.#attributeName));
    }, this.duration);
  }

  get #attributeName() {
    return "data-copy-success";
  }
}

export const action = (method) =>
  (element, options = {}) => {
    const instance = new Clipboard(element, options);

    return instance[method]();
  };

export default {
  copy: action("copy")
};
