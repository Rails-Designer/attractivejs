class Evaluate {
  #registry;

  constructor(registry) {
    this.#registry = registry;
  }

  async run(
    action,
    { for: event, on: element, using: defaultEventType, triggeredBy: modifier },
    { execute }
  ) {
    const isCustomEvent = action.includes("->");

    action = this.#stripCustomEvent({ from: action, for: event.type });
    if (action === undefined) return;

    const hasModifiers = action.includes(":");

    if (hasModifiers)
      action = this.#stripModifiers({ from: action, for: event, on: element });

    if (action === undefined) return;

    if (!isCustomEvent && !hasModifiers && event.type !== defaultEventType)
      return;

    return await execute(action, {
      with: { on: element, for: event, triggeredBy: modifier }
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

  #stripModifiers({ from: action, for: event, on: element }) {
    const parts = action.split(":");
    const allPass = parts
      .slice(1)
      .every((modifier) =>
        this.#passesModifier({ modifier, for: event, on: element })
      );

    if (!allPass) return;

    return parts[0];
  }

  #passesModifier({ modifier, for: event, on: element }) {
    const gate = this.#registry.getModifier(modifier);

    if (gate && gate.length === 1) {
      return gate({ event, element }) !== false;
    }

    return event.type === modifier;
  }
}

export default Evaluate;
