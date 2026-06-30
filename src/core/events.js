import Debug from "./../debug";

class Events {
  #registry;

  constructor(registry) {
    this.#registry = registry;
  }

  process(event, { on: element, using: defaultEventType }) {
    if (!element) return;

    this.#splitActions(element.dataset.action).some((action) => {
      const result = this.#evaluate(action, {
        for: event,
        on: element,
        using: defaultEventType
      });

      return result === false;
    });
  }

  // private

  #splitActions(action) {
    return action.split(" ").filter((action) => action);
  }

  #evaluate(action, { for: event, on: element, using: defaultEventType }) {
    let hasCustomEvent = false;

    if (action.includes("->")) {
      const [eventPart, actionPart] = action.split("->");
      const eventName = eventPart.includes("@")
        ? eventPart.split("@")[1]
        : eventPart;

      if (eventName !== event.type) return;

      action = actionPart;
      hasCustomEvent = true;
    }

    if (action.includes(":")) {
      const [actionPart, rawModifier] = action.split(":");
      const modifierFunction = this.#registry.getModifier(rawModifier);

      if (modifierFunction && modifierFunction.length === 1) {
        const result = modifierFunction({ event, element });

        if (!result) return;
      } else if (event.type !== rawModifier) {
        return;
      }

      action = actionPart;
    } else if (!hasCustomEvent && event.type !== defaultEventType) {
      return;
    }

    return this.#execute(action, { on: element, for: event });
  }

  #execute(action, { on: element, for: event }) {
    const parts = action.split("#");
    const [possibleAction, fallbackAction, fallbackValue] = parts;
    const actionName = this.#registry.hasAction(possibleAction)
      ? possibleAction
      : this.#registry.hasAction(fallbackAction)
        ? fallbackAction
        : action;

    const actionFunction = this.#registry.getAction(actionName);
    if (typeof actionFunction !== "function") return;

    const value = this.#registry.hasAction(possibleAction)
      ? parts.slice(1).join("#")
      : (fallbackValue ?? null);

    const startTime = performance.now();

    let result;

    try {
      result = actionFunction(element, {
        value,
        target: element.dataset.target,
        targets: element.dataset.targets
      });
    } catch (error) {
      Debug.error(
        `${actionName} on ${element.tagName.toLowerCase()}#${element.id || element.dataset.target || ""}: ${error.message}`
      );

      throw error;
    }

    const elapsed = (performance.now() - startTime).toFixed(2);

    const targetId = element.id || element.dataset.target || "";
    const target = targetId ? `#${targetId}` : "";
    const tag = element.tagName.toLowerCase();

    Debug.log(
      `${actionName} → ${tag}${target} (${elapsed}ms) [${event?.type}]`
    );

    if (result === false && event) event.preventDefault();

    return result;
  }
}

export default Events;
