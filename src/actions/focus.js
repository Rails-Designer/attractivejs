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

const activate =
  (method) =>
  (element, options = {}) =>
    new Focus(element, options)[method]();

export const focus = activate("focus");

const actions = { focus };

export default actions;

export const focusAction = {
  name: "focus",
  actions
};
