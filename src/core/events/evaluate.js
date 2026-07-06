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
    const isCustomEvent = action.includes("->");

    action = this.#stripCustomEvent({ from: action, for: event.type });
    if (action === undefined) return;

    const hasDirectives = action.includes(":");

    if (hasDirectives)
      action = this.#stripDirectives({ from: action, for: event, on: element });

    if (action === undefined) return;

    if (!isCustomEvent && !hasDirectives && event.type !== defaultEventType)
      return;

    return await execute(action, {
      with: { on: element, for: event, triggeredBy: directive }
    });
  }

  // private

  #stripCustomEvent({ from: action, for: eventType }) {
    if (!action.includes("->")) return action;

    const [eventPart, actionPart] = action.split("->");
    const eventName = eventPart.includes("@")
      ? eventPart.split("@")[1]
      : eventPart;

    if (eventName !== eventType) return;

    return actionPart;
  }

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
