class Triggers {
  #registry;

  constructor(registry) {
    this.#registry = registry;
  }

  setup({ for: directive, on: element, trigger: run, argument = null }) {
    const trigger = this.#registry.getTrigger(directive);

    if (!trigger) return false;

    trigger(element, run, argument);

    return true;
  }
}

export default Triggers;
