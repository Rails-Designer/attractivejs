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

export const focus = Focus.actionFor("focus");

const actions = { focus };

export default actions;

export const focusAction = {
  name: "focus",
  actions
};
