import { csrf } from "../../actions/request/csrf.js";
import { Template } from "./template.js";
import Debug from "../../debug.js";

class Form {
  #optimisticElements = [];

  constructor({ form, registry }) {
    this.form = form;
    this.registry = registry;
  }

  submit() {
    const send = (event) => this.#send(event);
    this.form.addEventListener("submit", send);

    return () => this.form.removeEventListener("submit", send);
  }

  // private

  async #send(event) {
    event.preventDefault();

    const action = this.form.getAttribute("action");
    const method = (this.form.getAttribute("method") || "post").toUpperCase();
    if (!action) return;

    const body = this.#data();
    this.#render(body);
    this.#busy();

    try {
      const request = await this.#fetch({ action, method, body });

      if (!request) {
        this.#clear({ error: true });
        this.#removeOptimistic();

        return;
      }

      this.#clear(request.ok ? { success: true } : { error: true });

      if (request.json.errors) {
        this.#validity({ errors: request.json.errors });
        this.#removeOptimistic();

        return;
      }

      this.#actions(request.json);
    } catch {
      this.#clear({ error: true });
      this.#removeOptimistic();
    }
  }

  #data() {
    const formData = new FormData(this.form);
    const body = {};

    for (const [key, value] of formData.entries()) {
      body[key] = value;
    }

    return body;
  }

  #render(body) {
    const templateId =
      this.form.dataset.template || this.form.dataset.attractTemplate || null;
    const target =
      this.form.dataset.attractTarget ||
      this.form.getAttribute("@target") ||
      null;
    const position = this.form.dataset.attractPosition || "append";

    if (templateId && target && Object.keys(body).length > 0) {
      this.#optimisticElements = new Template(templateId).render({
        target,
        position,
        with: body
      });
    }
  }

  #removeOptimistic() {
    for (const element of this.#optimisticElements) {
      element.remove();
    }

    this.#optimisticElements = [];
  }

  #busy() {
    this.form.removeAttribute("data-attract-busy");
    this.form.removeAttribute("data-attract-success");
    this.form.removeAttribute("data-attract-error");
    this.form.setAttribute("data-attract-busy", "");
  }

  async #fetch({ action, method, body }) {
    const headers = {
      "Content-Type": "application/json",
      Attract: "true"
    };

    if (csrf.token) {
      headers[csrf.header] =
        typeof csrf.token === "function" ? csrf.token() : csrf.token;
    }

    const response = await fetch(action, {
      method,
      headers,
      body: method === "GET" ? undefined : JSON.stringify(body)
    });

    let json;
    try {
      json = await response.json();
    } catch {
      return null;
    }

    return { ok: response.ok, json };
  }

  #clear({ success, error }) {
    this.form.removeAttribute("data-attract-busy");

    if (success) this.form.setAttribute("data-attract-success", "true");
    if (error) this.form.setAttribute("data-attract-error", "true");
  }

  #validity({ errors }) {
    for (const [name, message] of Object.entries(errors)) {
      const field = this.form.elements[name];

      if (field) {
        field.setCustomValidity(message);

        field.addEventListener("input", () => field.setCustomValidity(""), {
          once: true
        });
      }
    }

    this.form.reportValidity();
  }

  #actions(json) {
    const actions = json.actions ? json.actions : [json];

    for (const item of actions) {
      const [actionName, ...rest] = item.action.split("#");
      const actionValue = rest.join("#");

      if (item.data) {
        new Template(item.template).render({
          with: item.data,
          target: item.target,
          targets: item.targets,
          position: actionName
        });

        continue;
      }

      const action = this.registry?.getAction(actionName);
      if (!action) {
        Debug.warn(`Attract: unknown action "${actionName}"`);

        continue;
      }

      const targetElement = item.target
        ? document.getElementById(item.target)
        : item.targets
          ? document.querySelector(item.targets)
          : null;

      action(targetElement, {
        value: actionValue || item.value || null,
        target: item.target,
        targets: item.targets,
        dataset: {}
      });
    }
  }
}

export { Form };
