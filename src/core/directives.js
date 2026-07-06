class Directives {
  #registry;

  constructor(registry) {
    this.#registry = registry;
  }

  setup({ for: directive, on: element, trigger }) {
    const directiveFunction = this.#registry.getDirective(directive);

    if (!directiveFunction) return false;

    if (directiveFunction.length === 1) return true;

    directiveFunction(element, trigger);

    return true;
  }
}

export default Directives;
