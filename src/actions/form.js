import ActionBase from "./base";

class Form extends ActionBase {
  requestSubmit() {
    this.targets.forEach((target) => {
      const form =
        target instanceof HTMLFormElement ? target : target.form || null;

      if (form) form.requestSubmit();
    });
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
