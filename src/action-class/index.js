import ActionBase from "../actions/base";

export default class Action extends ActionBase {
  get value() {
    return this.options.value;
  }

  get dataset() {
    return this.element.dataset;
  }

  dispatchEvent(name, detail = {}) {
    this.element.dispatchEvent(
      new CustomEvent(name, { bubbles: true, detail })
    );
  }
}
