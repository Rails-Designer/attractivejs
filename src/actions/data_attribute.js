import ActionBase from "./base";

class DataAttribute extends ActionBase {
  constructor(currentElement, options = {}) {
    super(currentElement, options);

    const [attribute, value] = options.value.split("=");

    this.attribute = attribute;
    this.value = value;
  }

  toggle() {
    if (!this.attribute) return;

    this.targets.forEach(target => {
      (this.attribute in target.dataset) ? delete target.dataset[this.attribute] : target.dataset[this.attribute] = this.value || ""
    });
  }

  cycle() {
    if (!this.value) return;

    this.targets.forEach(target => this.#cycleDataAttribute(target));
  }

  add() {
    if (!this.attribute) return;

    this.targets.forEach(target => {
      target.dataset[this.attribute] = this.value || ""
    });
  }

  remove() {
    if (!this.attribute) return;

    this.targets.forEach(target => delete target.dataset[this.attribute]);
  }

  // private

  #cycleDataAttribute(target) {
    const nextValue = this.cycledValue(target.dataset[this.attribute], this.value);

    target.dataset[this.attribute] = nextValue;
  }
}

export const action = (method) =>
  (element, options = {}) => {
    const instance = new DataAttribute(element, options);

    return instance[method]();
  };

export default {
  toggleDataAttribute: action("toggle"),
  cycleDataAttribute: action("cycle"),
  addDataAttribute: action("add"),
  removeDataAttribute: action("remove")
};
