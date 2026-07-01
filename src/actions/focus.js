import ActionBase from "./base";

class Focus extends ActionBase {
  focus() {
    this.targets.forEach((target) => {
      if (typeof target.focus === "function") {
        target.focus();
      }
    });
  }
}

export const action =
  (method) =>
  (element, options = {}) =>
    new Focus(element, options)[method]();

export const focus = action("focus");

const actions = { focus };

export default actions;

export const plugin = {
  name: "focus",
  actions
};
