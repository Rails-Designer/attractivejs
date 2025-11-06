import ActionBase from "./base";

class Dialog extends ActionBase {
  open() {
    this.#targets.forEach(
      (target) => target instanceof HTMLDialogElement && target.show()
    );
  }

  openModal() {
    this.#targets.forEach(
      (target) => target instanceof HTMLDialogElement && target.showModal()
    );
  }

  close() {
    this.#targets.forEach(
      (target) => target instanceof HTMLDialogElement && target.close()
    );
  }

  // private

  get #targets() {
    return this.targetElement
      ? Array.from(document.querySelectorAll(this.targetElement))
      : Array.from(document.querySelectorAll("dialog"));
  }
}

const action =
  (method) =>
  (element, options = {}) => {
    new Dialog(element, options)[method]();
  };

export default {
  open: action("open"),
  openModal: action("openModal"),
  close: action("close")
};
