import ActionBase from "./base";

const attributeOperations = {
  get(element, name) {
    return element.getAttribute(name);
  },

  set(element, name, value) {
    element.setAttribute(name, value);
  },

  has(element, name) {
    return element.hasAttribute(name);
  },

  remove(element, name) {
    element.removeAttribute(name);
  }
};

const dataAttributeOperations = {
  get(element, name) {
    return element.dataset[name];
  },

  set(element, name, value) {
    element.dataset[name] = value;
  },

  has(element, name) {
    return name in element.dataset;
  },

  remove(element, name) {
    delete element.dataset[name];
  }
};

class DOMAttribute extends ActionBase {
  constructor(currentElement, options = {}) {
    super(currentElement, options);

    const [attribute, value] = options.value.split("=");

    this.attribute = attribute;
    this.value = value;
  }

  toggle() {
    if (!this.attribute) return;

    this.targets.forEach((target) =>
      this.operations.has(target, this.attribute)
        ? this.operations.remove(target, this.attribute)
        : this.operations.set(target, this.attribute, this.value || "")
    );
  }

  cycle() {
    if (!this.value) return;

    this.targets.forEach((target) => this.#cycleAttribute(target));
  }

  add() {
    if (!this.attribute) return;

    this.targets.forEach((target) =>
      this.operations.set(target, this.attribute, this.value || "")
    );
  }

  set() {
    return this.add();
  }

  remove() {
    if (!this.attribute) return;

    this.targets.forEach((target) =>
      this.operations.remove(target, this.attribute)
    );
  }

  #cycleAttribute(target) {
    const currentValue = this.operations.get(target, this.attribute);
    const nextValue = this.cycledValue(currentValue, this.value);

    this.operations.set(target, this.attribute, nextValue);
  }
}

class Attribute extends DOMAttribute {
  get operations() {
    return attributeOperations;
  }
}

class DataAttribute extends DOMAttribute {
  get operations() {
    return dataAttributeOperations;
  }
}

export const toggleAttribute = Attribute.actionFor("toggle");
export const cycleAttribute = Attribute.actionFor("cycle");
export const addAttribute = Attribute.actionFor("add");
export const setAttribute = Attribute.actionFor("set");
export const removeAttribute = Attribute.actionFor("remove");

export const toggleDataAttribute = DataAttribute.actionFor("toggle");
export const cycleDataAttribute = DataAttribute.actionFor("cycle");
export const addDataAttribute = DataAttribute.actionFor("add");
export const setDataAttribute = DataAttribute.actionFor("set");
export const removeDataAttribute = DataAttribute.actionFor("remove");

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

export const attributeAction = {
  name: "attribute",
  actions: attributeActions
};

export const dataAttributeAction = {
  name: "dataAttribute",
  actions: dataAttributeActions
};
