import ActionBase from "./base";
import { csrf } from "./request/csrf";
import Debug from "./../debug";
import Get from "./request/get";
import { activeRequests, crossingOrigin, setFeedback } from "./request/helpers";

class Request extends ActionBase {
  constructor(element, options = {}) {
    super(element, options);

    this.value = options.value;
  }

  async get() {
    return new Get(
      this.element,
      this.value,
      this.targets,
      this.options.onJSON
    ).execute();
  }

  post() {
    return this.#fetch("POST");
  }

  patch() {
    return this.#fetch("PATCH");
  }

  put() {
    return this.#fetch("PUT");
  }

  // private

  #fetch(method) {
    return this.#executeFetch(method);
  }

  #executeFetch(method) {
    if (!this.value) {
      Debug.warn("No URL provided in the action value");

      return;
    }

    if (crossingOrigin({ for: this.value })) {
      Debug.warn(
        `Cross-origin request to: ${this.value}. Missing the correct CORS headers.`
      );
    }

    const previous = activeRequests.get({ on: this.element });
    if (previous) previous.abort();

    const controller = new AbortController();
    activeRequests.set({ on: this.element, with: controller });

    setFeedback("busy", { on: this.element, for: this.targets });

    const headers = {
      "Content-Type": "application/json",
      Accept: "application/vnd.attract+json",
      Attract: "true"
    };

    if (csrf.token) {
      headers[csrf.header] =
        typeof csrf.token === "function" ? csrf.token() : csrf.token;
    }

    return fetch(this.value, {
      method,
      signal: controller.signal,
      headers,

      body: JSON.stringify(this.#body)
    })
      .then(async (response) => {
        if (!response.ok)
          throw new Error(`HTTP error! status: ${response.status}`);

        const contentType = response.headers.get("content-type");
        if (contentType?.includes("json") && this.options.onJSON) {
          const json = await response.json();

          this.options.onJSON(json);
        }

        setFeedback("success", { on: this.element, for: this.targets });
        activeRequests.delete({ on: this.element });

        return response;
      })
      .catch((error) => {
        if (error.name === "AbortError") return;

        activeRequests.delete({ on: this.element });
        setFeedback("error", { on: this.element, for: this.targets });

        throw error;
      });
  }

  get #body() {
    const body = {};
    const target = this.targets[0];

    if (target instanceof HTMLFormElement) {
      const formData = new FormData(target);

      for (const [key, value] of formData.entries()) {
        body[key] = value;
      }

      return body;
    }

    if (this.#inputField) {
      const key = this.element.name;
      const value = this.element.value;

      body[key] = value;
    }

    return body;
  }

  get #inputField() {
    return (
      this.element instanceof HTMLInputElement ||
      this.element instanceof HTMLSelectElement ||
      (this.element instanceof HTMLTextAreaElement && this.element.name)
    );
  }
}

export function get(element, options) {
  return new Request(element, { ...options, onJSON: get.onJSON }).get();
}
get.onJSON = null;

export function post(element, options) {
  return new Request(element, { ...options, onJSON: post.onJSON }).post();
}
post.onJSON = null;

export function patch(element, options) {
  return new Request(element, { ...options, onJSON: patch.onJSON }).patch();
}
patch.onJSON = null;

export function put(element, options) {
  return new Request(element, { ...options, onJSON: put.onJSON }).put();
}
put.onJSON = null;
