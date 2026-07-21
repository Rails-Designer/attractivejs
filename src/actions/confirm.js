import ActionBase from "./base";
import delay from "./helpers/delay";

const clearFeedback = delay();

class Confirm extends ActionBase {
  confirm() {
    const message = this.element.dataset.confirmMessage || "Are you sure?";
    const confirmed = window.confirm(message);

    this.#setFeedback(confirmed);

    return confirmed;
  }

  #setFeedback(confirmed) {
    this.element.setAttribute("data-confirm-success", confirmed);

    const duration = this.element.dataset.confirmFeedback;

    if (!duration) return;

    clearFeedback(
      () => this.element.removeAttribute("data-confirm-success"),
      parseInt(duration)
    );
  }
}

export const confirm = Confirm.actionFor("confirm");

const actions = { confirm };

export default actions;

export const confirmAction = {
  name: "confirm",
  actions
};
