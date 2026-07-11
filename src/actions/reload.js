import ActionBase from "./base";

class Reload extends ActionBase {
  reload() {
    this.targets.forEach((target) => {
      if (this.#reloadable(target)) target.reload();
    });
  }

  get targets() {
    if (this.target === "window") return [window.location];

    return super.targets;
  }

  // private

  #reloadable(target) {
    return typeof target.reload === "function";
  }
}

export const reload = Reload.actionFor("reload");

const actions = { reload, refresh: reload };

export default actions;

export const reloadAction = {
  name: "reload",
  actions
};
