class Observer {
  #callback;
  #observer;

  constructor(callback) {
    this.#callback = callback;
  }

  start(selector) {
    if (!window.MutationObserver) return;

    this.#observer = new MutationObserver((mutations) => {
      const elements = new Set();

      mutations.forEach((mutation) =>
        this.#processMutation(mutation, { for: selector, and: elements })
      );
      elements.forEach((element) => this.#callback(element));
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

  #processMutation(mutation, { for: selector, and: elements }) {
    if (mutation.type !== "childList") return;

    mutation.addedNodes.forEach((node) => {
      this.#processNode(node, { for: selector, and: elements });
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
