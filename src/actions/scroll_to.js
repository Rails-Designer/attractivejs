import ActionBase from "./base";

class ScrollTo extends ActionBase {
  constructor(currentElement, options = {}) {
    super(currentElement, options);

    const validBehaviors = ["auto", "instant", "smooth"];
    const behavior = options.value;

    this.behavior = validBehaviors.includes(behavior) ? behavior : "auto";
  }

  scroll() {
    this.targets[0]?.scrollIntoView({ behavior: this.behavior });
  }
}

const activate =
  (method) =>
  (element, options = {}) => {
    const instance = new ScrollTo(element, options);
    return instance[method]();
  };

export const scrollTo = activate("scroll");

const actions = { scrollTo };

export default actions;

export const scrollToAction = {
  name: "scrollTo",
  actions
};
