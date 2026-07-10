class ElementLifecycleHooks {
  #added = new Set();
  #removed = new Set();
  #beforeRemove = new Set();

  onAdded(callback) {
    this.#added.add(callback);

    return this;
  }

  onRemoved(callback) {
    this.#removed.add(callback);

    return this;
  }

  onBeforeRemove(callback) {
    this.#beforeRemove.add(callback);

    return this;
  }

  fireAdded(element) {
    this.#added.forEach((fn) => fn(element));
  }

  fireRemoved(element) {
    this.#removed.forEach((fn) => fn(element));
  }

  fireBeforeRemove(element) {
    this.#beforeRemove.forEach((fn) => fn(element));
  }

  clear() {
    this.#added.clear();
    this.#removed.clear();
    this.#beforeRemove.clear();
  }
}

export default ElementLifecycleHooks;
