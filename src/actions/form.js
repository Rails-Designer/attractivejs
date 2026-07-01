import ActionBase from "./base";
import debounce from "./../helpers/debounce";

class Form extends ActionBase {
  requestSubmit() {
    const delay = parseInt(this.currentElement.dataset.formDelay) || 0;

    const submit = () =>
      this.targets.forEach(
        (target) => target instanceof HTMLFormElement && target.requestSubmit()
      );

    if (delay) {
      debounce(submit, delay);
    } else {
      submit();
    }
  }

  reset() {
    this.targets.forEach(
      (target) => target instanceof HTMLFormElement && target.reset()
    );
  }
}

const action =
  (method) =>
  (element, options = {}) => {
    new Form(element, options)[method]();
  };

export const submit = action("requestSubmit");
export const reset = action("reset");

const actions = { submit, reset };

export default actions;

export const plugin = {
  name: "form",
  actions
};
