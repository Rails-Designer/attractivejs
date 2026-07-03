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

export const open = Dialog.actionFor("open");
export const openModal = Dialog.actionFor("openModal");
export const close = Dialog.actionFor("close");

const actions = { open, openModal, close };

export default actions;

export const dialogAction = {
  name: "dialog",
  actions
};
