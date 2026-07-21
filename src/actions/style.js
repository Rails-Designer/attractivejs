import ActionBase from "./base";

class Style extends ActionBase {
  constructor(element, options = {}) {
    super(element, options);

    const [prop, value] = (options.value || "").split("=");

    this.styleProperty = prop;
    this.styleValue = value;
  }

  set() {
    if (!this.styleProperty) return;

    this.targets.forEach((target) =>
      target.style.setProperty(this.styleProperty, this.styleValue || "")
    );
  }

  remove() {
    if (!this.styleProperty) return;

    this.targets.forEach((target) =>
      target.style.removeProperty(this.styleProperty)
    );
  }

  cycle() {
    if (!this.styleValue) return;

    this.targets.forEach((target) => {
      const current = target.style.getPropertyValue(this.styleProperty);
      const next = this.cycledValue(current, this.styleValue);

      target.style.setProperty(this.styleProperty, next);
    });
  }

  toggle() {
    if (!this.styleProperty) return;

    this.targets.forEach((target) => {
      const current = target.style.getPropertyValue(this.styleProperty);

      if (current !== "") {
        target.style.removeProperty(this.styleProperty);
      } else {
        target.style.setProperty(this.styleProperty, this.styleValue || "");
      }
    });
  }
}

export const setStyle = Style.actionFor("set");
export const removeStyle = Style.actionFor("remove");
export const cycleStyle = Style.actionFor("cycle");
export const toggleStyle = Style.actionFor("toggle");

const actions = { setStyle, removeStyle, cycleStyle, toggleStyle };

export default actions;

export const styleAction = {
  name: "style",
  actions
};
