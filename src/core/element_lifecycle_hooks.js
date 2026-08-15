class ElementLifecycleHooks {
  #added = new Set();
  #removed = new Set();
  #beforeRemove = new Set();
  #targetAdded = new Map();
  #targetRemoved = new Map();

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

  onTargetAdded(id, callback) {
    if (!this.#targetAdded.has(id)) this.#targetAdded.set(id, new Set());

    this.#targetAdded.get(id).add(callback);

    return this;
  }

  onTargetRemoved(id, callback) {
    if (!this.#targetRemoved.has(id)) this.#targetRemoved.set(id, new Set());

    this.#targetRemoved.get(id).add(callback);

    return this;
  }

  hasTarget(id) {
    return this.#targetAdded.has(id) || this.#targetRemoved.has(id);
  }

  notifyAdded(element) {
    this.#added.forEach((fn) => fn(element));
  }

  notifyRemoved(element) {
    this.#removed.forEach((fn) => fn(element));
  }

  notifyBeforeRemove(element) {
    this.#beforeRemove.forEach((fn) => fn(element));
  }

  notifyTargetAdded(element) {
    this.#targetAdded.get(element.id)?.forEach((fn) => fn(element));
  }

  notifyTargetRemoved(element) {
    this.#targetRemoved.get(element.id)?.forEach((fn) => fn(element));
  }

  clear() {
    this.#added.clear();
    this.#removed.clear();
    this.#beforeRemove.clear();
    this.#targetAdded.clear();
    this.#targetRemoved.clear();
  }
}

export default ElementLifecycleHooks;
