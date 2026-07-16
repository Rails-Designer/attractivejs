class Evaluate {
  #registry;

  constructor(registry) {
    this.#registry = registry;
  }

  async run(
    action,
    {
      for: event,
      on: element,
      using: defaultEventType,
      triggeredBy: directive
    },
    { execute }
  ) {
    if (action.startsWith("js:")) {
      return await execute(action, {
        with: { on: element, for: event, triggeredBy: directive || null }
      });
    }

    const hasDirectives = action.includes(":");

    if (hasDirectives)
      action = this.#stripDirectives({ from: action, for: event, on: element });

    if (action === undefined) return;

    return await execute(action, {
      with: { on: element, for: event, triggeredBy: directive || null }
    });
  }

  // private

  #stripDirectives({ from: action, for: event, on: element }) {
    const [base, ...directives] = action.split(":");

    if (
      !directives
        .filter(
          (name) => !(this.#registry.hasTrigger(name) && event.type === name)
        )
        .every((name) => this.#passes(name, { for: event, on: element }))
    )
      return;

    return base;
  }

  #passes(name, { for: event, on: element }) {
    const gated = this.#registry.getGate(name);

    if (!gated) return event.type === name;

    return gated(element, { event }) !== false;
  }
}

export default Evaluate;
