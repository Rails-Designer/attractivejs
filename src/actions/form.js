import ActionBase from "./base";
import debounce from "./../helpers/debounce";

const debouncedSubmit = debounce();

class Form extends ActionBase {
  requestSubmit() {
    const delay = parseInt(this.currentElement.dataset.formDebounce) || 0;

    const submit = () =>
      this.targets.forEach(
        (target) => target instanceof HTMLFormElement && target.requestSubmit()
      );

    if (delay) {
      debouncedSubmit(submit, delay);
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

export const submit = Form.actionFor("requestSubmit");
export const reset = Form.actionFor("reset");

const actions = { submit, reset };

export default actions;

export const formAction = {
  name: "form",
  actions
};
