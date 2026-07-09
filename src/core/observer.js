import Debug from "./../debug";

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

      mutations.forEach((mutation) =>
        this.#processMutation(mutation, {
          for: action,
          elements: { added, removed }
        })
      );

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
    });

    this.#observer.observe(this.#scope, { childList: true, subtree: true });

    return this;
  }

  stop() {
    if (this.#observer) this.#observer.disconnect();

    return this;
  }

  // private

  #processMutation(mutation, { for: action, elements: { added, removed } }) {
    if (mutation.type !== "childList") return;

    mutation.addedNodes.forEach((node) => {
      this.#processNode(node, { for: action, and: added });
    });

    mutation.removedNodes.forEach((node) => {
      this.#processNode(node, { for: action, and: removed });
    });
  }

  #processNode(node, { for: action, and: elements }) {
    if (node.nodeType !== Node.ELEMENT_NODE) return;
    if (action(node)) elements.add(node);
    if (!node.querySelectorAll) return;

    node.querySelectorAll("*").forEach((element) => {
      if (action(element)) elements.add(element);
    });
  }
}

export default Observer;
