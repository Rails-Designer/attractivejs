export default class ActionBase {
  constructor(currentElement, options = {}) {
    if (!currentElement) throw new Error("Current element is required");

    this.currentElement = currentElement;
    this.targetElement = options.targetElement;
    this.options = options;
  }

  get targets() {
    return this.targetElement ? Array.from(document.querySelectorAll(this.targetElement)) : [this.currentElement.parentElement];
  }
}
