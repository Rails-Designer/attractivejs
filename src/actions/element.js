import ActionBase from "./base";

class Element extends ActionBase {
  add() {
    const target = this.targets[0];
    if (!target) return;

    const sourceSelector = this.currentElement.dataset.elementSource;
    if (!sourceSelector) return;

    const source = document.getElementById(sourceSelector);
    if (!source) return;

    const clonedElement = this.#cloneSource(source);
    const position = this.currentElement.dataset.elementPosition || "beforeend";

    target.insertAdjacentElement(position, clonedElement);
  }

  remove() {
    const delay = parseInt(this.currentElement.dataset.removeDelay);

    const removeElements = () => {
      this.targets.forEach((target) => target.remove());
    };

    if (delay) {
      setTimeout(removeElements, delay);
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

export const add = action("add");
export const remove = action("remove");

const actions = { add, remove };

export default actions;

export const plugin = {
  name: "element",
  actions
};
