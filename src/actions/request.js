import ActionBase from "./base";
import { CSRF } from "./request/csrf";
import debounce from "./../helpers/debounce";

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

    this.#setFeedback("busy");

    try {
      const response = await fetch(this.value, { method: "GET" });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const html = await response.text();
      this.targets.forEach(target => {
        target.innerHTML = html
      });

      this.#setFeedback("success");

      return response;
    } catch (error) {
      console.error("GET request failed:", error);
      this.#setFeedback("error");

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

  #setFeedback(state) {
    const duration = this.currentElement.dataset.requestDuration;

    this.targets.forEach(target => {
      if (state === 'busy') {
        target.setAttribute('data-request-busy', 'true');

        target.removeAttribute('data-request-success');
      } else {
        target.removeAttribute('data-request-busy');

        target.setAttribute('data-request-success', state === 'success');
      }
    });

    if (!duration || state === 'busy') return;

    debounce(() => {
      this.targets.forEach(target => target.removeAttribute('data-request-success'));
    }, parseInt(duration));
  }

  #fetch(method) {
    if (!this.value) {
      console.warn("No URL provided in the action value");

      return;
    }

    this.#setFeedback('busy');

    return fetch(this.value, {
      method,
      headers: {
        "Content-Type": "application/json",
        "X-CSRF-Token": CSRF.get()
      },

      body: JSON.stringify(this.#body)
    })
      .then(response => {
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

        this.#setFeedback('success');

        return response;
      })
      .catch(error => {
        console.error(`${method} request failed:`, error);

        this.#setFeedback('error');

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
