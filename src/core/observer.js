class Observer {
  #prepare;
  #cleanup;
  #observer;

  constructor(prepare, cleanup = null) {
    this.#prepare = prepare;
    this.#cleanup = cleanup;
  }

  start(selector) {
    if (!window.MutationObserver) return;

    this.#observer = new MutationObserver((mutations) => {
      const added = new Set();
      const removed = new Set();

      mutations.forEach((mutation) =>
        this.#processMutation(mutation, { for: selector, elements: { added, removed } })
      );

      added.forEach((element) => this.#prepare(element));

      if (this.#cleanup) {
        removed.forEach((element) => this.#cleanup(element));
      }
    });

    this.#observer.observe(document.documentElement, {
      childList: true,
      subtree: true
    });

    return this;
  }

  stop() {
    if (this.#observer) this.#observer.disconnect();

    return this;
  }

  // private

  #processMutation(mutation, { for: selector, elements: { added, removed } }) {
    if (mutation.type !== "childList") return;

    mutation.addedNodes.forEach((node) => {
      this.#processNode(node, { for: selector, and: added });
    });

    mutation.removedNodes.forEach((node) => {
      this.#processNode(node, { for: selector, and: removed });
    });
  }

  #processNode(node, { for: selector, and: elements }) {
    if (node.nodeType !== Node.ELEMENT_NODE) return;
    if (node.matches && node.matches(selector)) elements.add(node);
    if (!node.querySelectorAll) return;

    node.querySelectorAll(selector).forEach((element) => elements.add(element));
  }
}

export default Observer;
