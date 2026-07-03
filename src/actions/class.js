import ActionBase from "./base";
import { sanitize } from "./../helpers/sanitize";

class Class extends ActionBase {
  constructor(currentElement, options = {}) {
    super(currentElement, options);

    this.value = sanitize(options.value);
  }

  toggle() {
    if (!this.value) return;

    this.targets.forEach((target) => this.#toggleClasses({ forEach: target }));
  }

  cycle() {
    if (!this.value || this.value.length === 0) return;

    this.targets.forEach((target) => this.#cycleClasses(target));
  }

  add() {
    if (!this.value) return;

    this.targets.forEach((target) => target.classList.add(...this.value));
  }

  set() {
    if (!this.value) return;

    this.targets.forEach((target) => {
      target.className = "";
      target.classList.add(...this.value);
    });
  }

  remove() {
    if (!this.value) return;

    this.targets.forEach((target) => target.classList.remove(...this.value));
  }

  // private

  #toggleClasses({ forEach: target }) {
    this.value.forEach((className) => target.classList.toggle(className));
  }

  #cycleClasses(target) {
    const currentClass =
      this.value.find((className) => target.classList.contains(className)) || "";
    const nextClass = this.cycledValue(currentClass, this.value);

    target.classList.remove(...this.value);
    target.classList.add(nextClass);
  }
}

const activate =
  (method) =>
  (element, options = {}) => {
    const instance = new Class(element, options);

    return instance[method]();
  };

export const toggleClass = activate("toggle");
export const cycleClass = activate("cycle");
export const addClass = activate("add");
export const setClass = activate("set");
export const removeClass = activate("remove");

const actions = { toggleClass, cycleClass, addClass, setClass, removeClass };

export default actions;

export const classAction = {
  name: "class",
  actions
};
