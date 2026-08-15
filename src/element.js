import Attractive from "./core";
import builtinActions from "./actions";
import { builtinGates, builtinTriggers } from "./core/builtin_directives";
import Debug from "./debug";

const RESERVED = new Set([
  "connect",
  "disconnect",
  "target",
  "targets",
  "element",
  "elements"
]);

class AttractiveElement extends HTMLElement {
  #attractive;

  connectedCallback() {
    this.#attractive = new Attractive();
    this.#attractive.activate({
      on: this,
      addActions: { ...builtinActions, ...this.#actions() },
      addGates: builtinGates,
      addTriggers: builtinTriggers
    });

    this.connect?.();

    this.#registerTargetLifecycle();

    const tag = this.tagName.toLowerCase();
    const id = this.id ? `#${this.id}` : "";

    Debug.log("element connected →", `${tag}${id}`);
  }

  disconnectedCallback() {
    this.disconnect?.();
    this.#attractive?.deactivate();

    const tag = this.tagName.toLowerCase();
    const id = this.id ? `#${this.id}` : "";

    Debug.log("element disconnected →", `${tag}${id}`);
  }

  target(id) {
    return this.querySelector(`[id="${id}"]`);
  }

  targets(selector) {
    return Array.from(this.querySelectorAll(selector));
  }

  element(selector) {
    return document.querySelector(selector);
  }

  elements(selector) {
    return Array.from(document.querySelectorAll(selector));
  }

  // private

  #actions() {
    const actions = {};

    for (const [name, method] of this.#publicMethods()) {
      if (RESERVED.has(name)) continue;

      actions[name] = (element, context) => method.call(this, element, context);
    }

    return actions;
  }

  #registerTargetLifecycle() {
    for (const [name, method] of this.#publicMethods()) {
      const connected = name.match(/^(.+)TargetConnected$/);
      if (connected) {
        const targetName = connected[1];
        this.#attractive.onTargetConnected(targetName, (element) => {
          const tag = this.tagName.toLowerCase();
          const id = this.id ? `#${this.id}` : "";

          Debug.log(
            "target connected →",
            `#${targetName}`,
            "in",
            `${tag}${id}`
          );
          method.call(this, element);
        });
      }

      const disconnected = name.match(/^(.+)TargetDisconnected$/);
      if (disconnected) {
        const targetName = disconnected[1];
        this.#attractive.onTargetDisconnected(targetName, (element) => {
          const tag = this.tagName.toLowerCase();
          const id = this.id ? `#${this.id}` : "";

          Debug.log(
            "target disconnected →",
            `#${targetName}`,
            "in",
            `${tag}${id}`
          );
          method.call(this, element);
        });
      }
    }
  }

  #publicMethods() {
    const methods = new Map();
    let prototype = this.constructor.prototype;

    while (prototype && prototype !== HTMLElement.prototype) {
      for (const name of Object.getOwnPropertyNames(prototype)) {
        if (name === "constructor" || methods.has(name)) continue;
        if (typeof prototype[name] === "function") {
          methods.set(name, prototype[name]);
        }
      }

      prototype = Object.getPrototypeOf(prototype);
    }

    return methods;
  }
}

export default AttractiveElement;
export { AttractiveElement };
