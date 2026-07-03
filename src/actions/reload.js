import ActionBase from "./base";

class Reload extends ActionBase {
  reload() {
    this.targets.forEach((target) => {
      this.#isTurboFrame(target) ? target.reload() : window.location.reload();
    });
  }

  // private

  #isTurboFrame(target) {
    return (
      target.tagName === "TURBO-FRAME" && typeof target.reload === "function"
    );
  }
}

const activate =
  (method) =>
  (element, options = {}) => {
    const instance = new Reload(element, options);

    return instance[method]();
  };

export const reload = activate("reload");

const actions = { reload, refresh: reload };

export default actions;

export const reloadAction = {
  name: "reload",
  actions
};
