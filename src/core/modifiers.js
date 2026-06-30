class Modifiers {
  #registry;

  constructor(registry) {
    this.#registry = registry;
  }

  setup({ for: modifier, on: element, trigger }) {
    const modifierFunction = this.#registry.getModifier(modifier);

    if (!modifierFunction) return false;

    if (modifierFunction.length === 1) return true;

    modifierFunction(element, trigger);

    return true;
  }
}

export default Modifiers;
