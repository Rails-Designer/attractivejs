class EventSubscriptions {
  #subscriptions = new Map();
  #scope = document;

  setScope(scope) {
    this.#scope = scope;
  }

  add(type, callback) {
    if (!this.#subscriptions.has(type)) {
      const listener = (event) => {
        this.#subscriptions.get(type).subscriptions.forEach((fn) => fn(event));
      };

      this.#scope.addEventListener(type, listener);
      this.#subscriptions.set(type, { listener, subscriptions: new Set() });
    }

    this.#subscriptions.get(type).subscriptions.add(callback);

    return this;
  }

  removeAll() {
    this.#subscriptions.forEach(({ listener }, type) => {
      this.#scope.removeEventListener(type, listener);
    });

    this.#subscriptions.clear();
  }
}

export default EventSubscriptions;
