import Debug from "./../../debug";
import { activeRequests, crossingOrigin, setFeedback } from "./helpers";

export default class Get {
  #element;
  #url;
  #targets;
  #onJSON;

  constructor(currentElement, url, targets, onJSON) {
    this.#element = currentElement;
    this.#url = url;
    this.#targets = targets;
    this.#onJSON = onJSON;
  }

  async execute() {
    if (!this.#url) {
      Debug.warn("No URL provided in the action value");

      return;
    }

    this.#warnCrossOrigin();

    const controller = this.#start();

    try {
      const response = await this.#fetch(controller);

      await this.#process(response);

      this.#succeed();

      return response;
    } catch (error) {
      this.#fail(error);
    }
  }

  // private

  #warnCrossOrigin() {
    if (crossingOrigin({ for: this.#url })) {
      Debug.warn(
        `Cross-origin request to: ${this.#url}. Missing the correct CORS headers.`
      );
    }
  }

  #start() {
    const previous = activeRequests.get({ on: this.#element });
    if (previous) previous.abort();

    const controller = new AbortController();
    activeRequests.set({ on: this.#element, with: controller });

    setFeedback("busy", { on: this.#element, for: this.#targets });

    return controller;
  }

  #fetch(controller) {
    return fetch(this.#url, {
      method: "GET",
      signal: controller.signal,
      headers: {
        Accept: "application/vnd.attract+json",
        Attract: "true"
      }
    });
  }

  async #process(response) {
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

    const contentType = response.headers.get("content-type");
    if (contentType?.includes("json")) {
      const json = await response.json();

      if (this.#onJSON) this.#onJSON(json);
    } else {
      const html = await response.text();

      this.#targets.forEach((target) => {
        target.innerHTML = html;
      });
    }
  }

  #succeed() {
    activeRequests.delete({ on: this.#element });
    setFeedback("success", { on: this.#element, for: this.#targets });
  }

  #fail(error) {
    if (error.name === "AbortError") return;

    activeRequests.delete({ on: this.#element });
    setFeedback("error", { on: this.#element, for: this.#targets });

    throw error;
  }
}
