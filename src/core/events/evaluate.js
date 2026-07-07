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
    const parts = action.split(":");
    const allPass = parts
      .slice(1)
      .every((name) =>
        this.#passesGate({ gate: name, for: event, on: element })
      );

    if (!allPass) return;

    return parts[0];
  }

  #passesGate({ gate: name, for: event, on: element }) {
    const gateFn = this.#registry.getDirective(name);

    if (gateFn && gateFn.length === 1) {
      return gateFn({ event, element }) !== false;
    }

    return event.type === name;
  }
}

export default Evaluate;
