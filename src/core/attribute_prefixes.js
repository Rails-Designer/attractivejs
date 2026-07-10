import { actionAttributes } from "./attributes";

class AttributePrefixes {
  #prefixes = new Set();

  add(prefix) {
    this.#prefixes.add(prefix);

    return this;
  }

  matches(element) {
    if (actionAttributes(element)) return true;

    return Array.from(this.#prefixes).some((prefix) =>
      Array.from(element.attributes).some((attribute) =>
        attribute.name.startsWith(prefix)
      )
    );
  }

  clear() {
    this.#prefixes.clear();
  }
}

export default AttributePrefixes;
