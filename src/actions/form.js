import ActionBase from "./base";
import debounce from "./../helpers/debounce";

class Form extends ActionBase {
  requestSubmit() {
    const submit = () => this.targets.forEach(target => target instanceof HTMLFormElement && target.requestSubmit());
    const delay = parseInt(this.currentElement.dataset.submitDelay) || 0;

    (delay > 0) ? debounce(submit, delay) : submit();
  }

  reset() {
    this.targets.forEach(target => target instanceof HTMLFormElement && target.reset());
  }
}

const action = (method) => (element, options = {}) => {
  new Form(element, options)[method]();
};

export default {
  submit: action("requestSubmit"),
  reset: action("reset")
};
