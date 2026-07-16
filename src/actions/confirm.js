import ActionBase from "./base";
import delay from "./helpers/delay";

const clearFeedback = delay();

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

    const duration = this.currentElement.dataset.confirmFeedback;

    if (!duration) return;

    clearFeedback(
      () => this.currentElement.removeAttribute("data-confirm-success"),
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
