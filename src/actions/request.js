import ActionBase from "./base";
import { CSRF } from "./request/csrf";

class Request extends ActionBase {
    constructor(currentElement, options = {}) {
      super(currentElement, options);

      this.value = options.value;
    }

    async get() {
      if (!this.value) {
        console.warn("No URL provided in the action value");

        return;
      }

      if (this.#crossingOrigin({ with: this.value })) {
        console.warn(
          `Cross-origin request to: ${this.value}. Missing the correct CORS headers.`
        );
      }

      try {
        const response = await fetch(this.value, { method: "GET" });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const html = await response.text();
        this.targets.forEach(target => target.innerHTML = html);

        return response;
      } catch (error) {
        console.error("GET request failed:", error);

        throw error;
      }
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

    #crossingOrigin({ with: url }) {
      try {
        const requestUrl = new URL(url, window.location.href);

        return requestUrl.origin !== window.location.origin;
      } catch {
        console.error("Invalid URL:", url);

        return false;
      }
    }

    #fetch(method) {
      if (!this.value) {
        console.warn("No URL provided in the action value");

        return;
      }

      return fetch(this.value, {
        method: method,
        headers: {
          "Content-Type": "application/json",
          "X-CSRF-Token": CSRF.get()
        },

        body: JSON.stringify(this.#body)
      })
      .catch(error => console.error(`${method} request failed:`, error));
  }

  get #body() {
    let body = {};

    if (this.#inputField) {
      const key = this.currentElement.name;
      const value = this.currentElement.value;

      body[key] = value;
    }

    return body;
  }

  get #inputField() {
    return this.currentElement instanceof HTMLInputElement ||
      this.currentElement instanceof HTMLSelectElement ||
      this.currentElement instanceof HTMLTextAreaElement &&
      this.currentElement.name
  }
}

export const action = (method) => (element, options = {}) => {
  const instance = new Request(element, options);

  return instance[method]();
};

export default {
  get: action("get"),
  post: action("post"),
  patch: action("patch"),
  put: action("put")
};
