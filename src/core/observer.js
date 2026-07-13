import Debug from "./../debug";

const ELEMENT_NODE = (typeof Node !== "undefined" && Node.ELEMENT_NODE) || 1;
const ATTRIBUTE_PREFIX = "@";
const RESERVED_ATTRIBUTES = new Set(["@target", "@targets"]);

class Observer {
  #prepare;
  #cleanup;
  #beforeCleanup;
  #observer;
  #scope;

  constructor(
    prepare,
    cleanup = null,
    scope = document.documentElement,
    beforeCleanup = null
  ) {
    this.#prepare = prepare;
    this.#cleanup = cleanup;
    this.#beforeCleanup = beforeCleanup;
    this.#scope = scope;
  }

  start(action) {
    if (!window.MutationObserver) return;

    this.#observer = new MutationObserver((mutations) => {
      const added = new Set();
      const removed = new Set();
      const changed = new Set();

      for (const mutation of mutations) {
        if (mutation.type === "childList") {
          this.#processChildMutation(mutation, {
            for: action,
            elements: { added, removed }
          });

          continue;
        }

        if (
          mutation.type === "attributes" &&
          mutation.attributeName.startsWith(ATTRIBUTE_PREFIX) &&
          !RESERVED_ATTRIBUTES.has(mutation.attributeName)
        ) {
          changed.add(mutation.target);
        }
      }

      added.forEach((element) => {
        Debug.log(
          "Element added:",
          element.tagName.toLowerCase(),
          "#" + (element.id || element.dataset.target || "")
        );

        this.#prepare(element);
      });

      if (this.#beforeCleanup || this.#cleanup) {
        removed.forEach((element) => {
          Debug.log(
            "Element removed:",
            element.tagName.toLowerCase(),
            "#" + (element.id || "")
          );

          this.#beforeCleanup?.(element);
          this.#cleanup?.(element);
        });
      }

      if (this.#cleanup) {
        changed.forEach((element) => {
          if (removed.has(element)) return;

          Debug.log(
            "Attribute changed:",
            element.tagName.toLowerCase(),
            "#" + (element.id || "")
          );

          this.#cleanup(element);

          if (action(element)) {
            this.#prepare(element);
          }
        });
      }
    });

    this.#observer.observe(this.#scope, {
      childList: true,
      subtree: true,
      attributes: true
    });

    return this;
  }

  stop() {
    if (this.#observer) this.#observer.disconnect();

    return this;
  }

  // private

  #processChildMutation(
    mutation,
    { for: action, elements: { added, removed } }
  ) {
    mutation.addedNodes.forEach((node) => {
      this.#processNode(node, { for: action, and: added });
    });

    mutation.removedNodes.forEach((node) => {
      this.#processNode(node, { for: action, and: removed });
    });
  }

  #processNode(node, { for: action, and: elements }) {
    if (node.nodeType !== ELEMENT_NODE) return;
    if (action(node)) elements.add(node);
    if (!node.querySelectorAll) return;

    node.querySelectorAll("*").forEach((element) => {
      if (action(element)) elements.add(element);
    });
  }
}

export default Observer;
