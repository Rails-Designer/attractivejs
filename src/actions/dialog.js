import ActionBase from "./base";

class Dialog extends ActionBase {
  open() {
    this.targets.forEach(
      (target) => target instanceof HTMLDialogElement && target.show()
    );
  }

  openModal() {
    this.targets.forEach(
      (target) => target instanceof HTMLDialogElement && target.showModal()
    );
  }

  close() {
    this.targets.forEach(
      (target) => target instanceof HTMLDialogElement && target.close()
    );
  }
}

const action =
  (method) =>
  (element, options = {}) => {
    new Dialog(element, options)[method]();
  };

const actions = {
  open: action("open"),
  openModal: action("openModal"),
  close: action("close")
};

export default actions;

export const plugin = {
  name: "dialog",
  actions
};
