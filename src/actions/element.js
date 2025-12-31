import ActionBase from "./base";
import debounce from "./../helpers/debounce";

class Element extends ActionBase {
  add() {
    const target = this.targets[0];
    if (!target) return;

    const sourceSelector = this.currentElement.dataset.addSource;
    if (!sourceSelector) return;

    const source = document.querySelector(sourceSelector);
    if (!source) return;

    const clonedElement = this.#cloneSource(source);
    const position = this.currentElement.dataset.addAt || "beforeend";

    target.insertAdjacentElement(position, clonedElement);
  }

  remove() {
    const delay = parseInt(this.currentElement.dataset.removeDelay);

    const removeElements = () => {
      this.targets.forEach((target) => target.remove());
    };

    if (delay) {
      debounce(removeElements, delay);
    } else {
      removeElements();
    }
  }

  // private

  #cloneSource(source) {
    return source.tagName === "TEMPLATE"
      ? source.content.cloneNode(true).firstElementChild
      : source.cloneNode(true);
  }
}

export const action =
  (method) =>
  (element, options = {}) => {
    const instance = new Element(element, options);

    return instance[method]();
  };

export default {
  add: action("add"),
  remove: action("remove")
};
