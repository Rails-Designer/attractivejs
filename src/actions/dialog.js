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

const activate =
  (method) =>
  (element, options = {}) => {
    new Dialog(element, options)[method]();
  };

export const open = activate("open");
export const openModal = activate("openModal");
export const close = activate("close");

const actions = { open, openModal, close };

export default actions;

export const dialogAction = {
  name: "dialog",
  actions
};
