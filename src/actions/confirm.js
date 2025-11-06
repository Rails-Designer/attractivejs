import ActionBase from "./base";
import debounce from "./../helpers/debounce";

class Confirm extends ActionBase {
  confirm() {
    const message =
      this.currentElement.dataset.confirmMessage || "Are you sure?";
    const confirmed = window.confirm(message);

    this.#setFeedback(confirmed);

    return confirmed;
  }

  #setFeedback(confirmed) {
    this.currentElement.setAttribute("data-confirm-success", confirmed);

    const duration = this.currentElement.dataset.confirmDuration;

    if (!duration) return;

    debounce(
      () => this.currentElement.removeAttribute("data-confirm-success"),
      parseInt(duration)
    );
  }
}

export const action =
  (method) =>
  (element, options = {}) =>
    new Confirm(element, options)[method]();

export default {
  confirm: action("confirm")
};
