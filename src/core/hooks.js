class Hooks {
  #before = new Set();
  #after = new Set();
  #error = new Set();

  addBefore(callback) {
    this.#before.add(callback);

    return this;
  }

  addAfter(callback) {
    this.#after.add(callback);

    return this;
  }

  addError(callback) {
    this.#error.add(callback);

    return this;
  }

  removeBefore(callback) {
    this.#before.delete(callback);

    return this;
  }

  removeAfter(callback) {
    this.#after.delete(callback);

    return this;
  }

  removeError(callback) {
    this.#error.delete(callback);

    return this;
  }

  runBefore(context) {
    for (const callback of this.#before) {
      const result = callback(context);

      if (result === false) return false;
    }
  }

  runAfter(context) {
    for (const callback of this.#after) {
      callback(context);
    }
  }

  runError(context) {
    for (const callback of this.#error) {
      callback(context);
    }
  }
}

export default Hooks;
