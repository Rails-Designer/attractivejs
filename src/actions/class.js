import ActionBase from "./base";
import { sanitize } from "./../helpers/sanitize";

class Class extends ActionBase {
  constructor(currentElement, options = {}) {
    super(currentElement, options);

    this.value = sanitize(options.value);
  }

  toggle() {
    if (!this.value) return;

    this.targets.forEach(target => this.#toggleClasses({ forEach: target }));
  }

  add() {
    if (!this.value) return;

    this.targets.forEach(target => target.classList.add(...this.value));
  }

  remove() {
    if (!this.value) return;

    this.targets.forEach(target => target.classList.remove(...this.value));
  }

  // private

  #toggleClasses({ forEach: target }) {
    this.value.forEach(className => target.classList.toggle(className));
  }
}

export const action = (method) =>
  (element, options = {}) => {
    const instance = new Class(element, options);

    return instance[method]();
  };

export default {
  toggleClass: action("toggle"),
  addClass: action("add"),
  removeClass: action("remove")
};
