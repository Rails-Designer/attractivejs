import ActionBase from "./base";

class Reload extends ActionBase {
  reload() {
    this.targets.forEach((target) => {
      this.#isTurboFrame(target) ? target.reload() : window.location.reload();
    });
  }

  // private

  #isTurboFrame(target) {
    return target.tagName === "TURBO-FRAME" && typeof target.reload === "function";
  }
}

export const action =
  (method) =>
  (element, options = {}) => {
    const instance = new Reload(element, options);

    return instance[method]();
  };

export default {
  reload: action("reload"),
  refresh: action("reload")
};
