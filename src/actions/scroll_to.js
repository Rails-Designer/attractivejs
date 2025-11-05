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

export const action = (method) =>
  (element, options = {}) => {
    const instance = new ScrollTo(element, options);
    return instance[method]();
  };

export default {
  scrollTo: action("scroll")
};
