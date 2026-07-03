import Debug from "./../debug";

export default class ActionBase {
  static actionFor(method) {
    return (element, options = {}) => {
      const instance = new this(element, options);

      return instance[method]();
    };
  }

  constructor(currentElement, options = {}) {
    if (!currentElement) throw new Error("Current element is required");

    this.currentElement = currentElement;
    this.target = options.target;
    this.targetsSelector = options.targets;
    this.options = options;
  }

  get targets() {
    if (this.targetsSelector) {
      return Array.from(document.querySelectorAll(this.targetsSelector));
    }

    if (this.target) {
      const element = document.getElementById(this.target);

      if (!element) {
        Debug.warn(`Target "#${this.target}" not found`);
      }

      return element ? [element] : [];
    }

    return [this.currentElement];
  }

  cycledValue(currentValue, nextValues) {
    const values = Array.isArray(nextValues)
      ? nextValues
      : nextValues.split(",").map((value) => value.trim());
    const currentIndex = values.indexOf(currentValue);
    const nextIndex = (currentIndex + 1) % values.length;

    return values[nextIndex];
  }
}
