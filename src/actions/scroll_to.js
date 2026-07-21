import ActionBase from "./base";

class ScrollTo extends ActionBase {
  constructor(element, options = {}) {
    super(element, options);

    const validBehaviors = ["auto", "instant", "smooth"];
    const behavior = options.value;

    this.behavior = validBehaviors.includes(behavior) ? behavior : "auto";
  }

  scroll() {
    this.targets[0]?.scrollIntoView({ behavior: this.behavior });
  }
}

export const scrollTo = ScrollTo.actionFor("scroll");

const actions = { scrollTo };

export default actions;

export const scrollToAction = {
  name: "scrollTo",
  actions
};
