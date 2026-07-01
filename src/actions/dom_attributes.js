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

  set() {
    return this.add();
  }

  remove() {
    if (!this.attribute) return;

    this.targets.forEach((target) => target.removeAttribute(this.attribute));
  }

  #cycleAttribute(target) {
    const nextValue = this.cycledValue(
      target.getAttribute(this.attribute),
      this.value
    );

    target.setAttribute(this.attribute, nextValue);
  }
}

class DataAttribute extends ActionBase {
  constructor(currentElement, options = {}) {
    super(currentElement, options);

    const [attribute, value] = options.value.split("=");

    this.attribute = attribute;
    this.value = value;
  }

  toggle() {
    if (!this.attribute) return;

    this.targets.forEach((target) => {
      this.attribute in target.dataset
        ? delete target.dataset[this.attribute]
        : (target.dataset[this.attribute] = this.value || "");
    });
  }

  cycle() {
    if (!this.value) return;

    this.targets.forEach((target) => this.#cycleDataAttribute(target));
  }

  add() {
    if (!this.attribute) return;

    this.targets.forEach((target) => {
      target.dataset[this.attribute] = this.value || "";
    });
  }

  set() {
    return this.add();
  }

  remove() {
    if (!this.attribute) return;

    this.targets.forEach((target) => delete target.dataset[this.attribute]);
  }

  #cycleDataAttribute(target) {
    const nextValue = this.cycledValue(
      target.dataset[this.attribute],
      this.value
    );

    target.dataset[this.attribute] = nextValue;
  }
}

const action =
  (method, ClassType) =>
  (element, options = {}) => {
    const instance = new ClassType(element, options);

    return instance[method]();
  };

export const toggleAttribute = action("toggle", Attribute);
export const cycleAttribute = action("cycle", Attribute);
export const addAttribute = action("add", Attribute);
export const setAttribute = action("set", Attribute);
export const removeAttribute = action("remove", Attribute);

export const toggleDataAttribute = action("toggle", DataAttribute);
export const cycleDataAttribute = action("cycle", DataAttribute);
export const addDataAttribute = action("add", DataAttribute);
export const setDataAttribute = action("set", DataAttribute);
export const removeDataAttribute = action("remove", DataAttribute);

const attributeActions = {
  toggleAttribute,
  cycleAttribute,
  addAttribute,
  setAttribute,
  removeAttribute
};

const dataAttributeActions = {
  toggleDataAttribute,
  cycleDataAttribute,
  addDataAttribute,
  setDataAttribute,
  removeDataAttribute
};

export { dataAttributeActions };

export default attributeActions;

export const plugin = {
  name: "attribute",
  actions: attributeActions
};

export const dataPlugin = {
  name: "dataAttribute",
  actions: dataAttributeActions
};
