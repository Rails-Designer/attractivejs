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

export const reload = Reload.actionFor("reload");

const actions = { reload, refresh: reload };

export default actions;

export const reloadAction = {
  name: "reload",
  actions
};
