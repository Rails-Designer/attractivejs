import ActionBase from "./base";

class Attribute extends ActionBase {
  constructor(currentElement, options = {}) {
    super(currentElement, options);

    const [attribute, value] = options.value.split("=");

    this.attribute = attribute;
    this.value = value;
  }

  toggle() {
    if (!this.attribute) return;

    this.targets.forEach((target) =>
      target.hasAttribute(this.attribute)
        ? target.removeAttribute(this.attribute)
        : target.setAttribute(this.attribute, this.value || "")
    );
  }

  cycle() {
    if (!this.value) return;

    this.targets.forEach((target) => this.#cycleAttribute(target));
  }

  add() {
    if (!this.attribute) return;

    this.targets.forEach((target) =>
      target.setAttribute(this.attribute, this.value || "")
    );
  }

  remove() {
    if (!this.attribute) return;

    this.targets.forEach((target) => target.removeAttribute(this.attribute));
  }

  // private

  #cycleAttribute(target) {
    const nextValue = this.cycledValue(
      target.getAttribute(this.attribute),
      this.value
    );

    target.setAttribute(this.attribute, nextValue);
  }
}

export const action =
  (method) =>
  (element, options = {}) => {
    const instance = new Attribute(element, options);

    return instance[method]();
  };

export default {
  toggleAttribute: action("toggle"),
  cycleAttribute: action("cycle"),
  addAttribute: action("add"),
  removeAttribute: action("remove")
};
