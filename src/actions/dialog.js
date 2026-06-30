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

export const open = action("open");
export const openModal = action("openModal");
export const close = action("close");

const actions = { open, openModal, close };

export default actions;

export const plugin = {
  name: "dialog",
  actions
};
