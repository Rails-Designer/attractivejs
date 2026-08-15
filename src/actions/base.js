import Debug from "./../debug";
import { scopeOf } from "../core/scopes";

export default class ActionBase {
  static actionFor(method) {
    return (element, options = {}) => {
      const instance = new this(element, options);

      return instance[method]();
    };
  }

  constructor(element, options = {}) {
    if (!element) throw new Error("Current element is required");

    this.element = element;
    this.target = options.target;
    this.targetsSelector = options.targets;
    this.options = options;
  }

  get targets() {
    const scope = scopeOf(this.element);

    if (this.targetsSelector) {
      return Array.from(scope.querySelectorAll(this.targetsSelector));
    }

    if (this.target) {
      const target = scope.querySelector(`[id="${this.target}"]`);

      if (!target) {
        Debug.warn(`Target "#${this.target}" not found`);
      }

      return target ? [target] : [];
    }

    return [this.element];
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
