import ActionBase from "./base";

class Form extends ActionBase {
  requestSubmit() {
    const submit = () => this.targets.forEach(target => target instanceof HTMLFormElement && target.requestSubmit());
    const debounce = parseInt(this.currentElement.dataset.submitDelay) || 0;

    (debounce > 0) ? this.#debounce(submit, debounce) : submit();
  }

  reset() {
    this.targets.forEach(target => target instanceof HTMLFormElement && target.reset());
  }

  // private

  static #debounceTimeout = null;

  #debounce(callback, delay) {
    clearTimeout(Form.#debounceTimeout);

    Form.#debounceTimeout = setTimeout(callback, delay);
  }
}

const action = (method) => (element, options = {}) => {
  new Form(element, options)[method]();
};

export default {
  submit: action("requestSubmit"),
  reset: action("reset")
};
