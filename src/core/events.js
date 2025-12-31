import Debug from "./../debug";

class Events {
  #actions;

  constructor(actions) {
    Debug.log("Events with actions:", Object.keys(actions));

    this.#actions = actions;
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
    return action.split(" ").filter(action => action);
  }

  #evaluate(action, { for: event, on: element, using: defaultEventType }) {
    Debug.log("Process action for", event.type, "on", element, "…");

    if (action.includes("->")) {
      const [eventPart, actionPart] = action.split("->");
      const eventName = eventPart.includes("@") ? eventPart.split("@")[1] : eventPart;

      if (eventName !== event.type) return;

      action = actionPart;
    } else if (event.type !== defaultEventType) {
      return;
    }

    Debug.log("…", "processed action for", event.type, "on", element);

    return this.#execute(action, { on: element, for: event });
  }

  #execute(action, { on: element, for: event }) {
    Debug.log("Execute action", action, "on", element, "…");

    const parts = action.split("#");
    const [possibleAction, fallbackAction, fallbackValue] = parts;
    const actionName = this.#actions[possibleAction]
      ? possibleAction
      : (fallbackAction ?? action);

    if (typeof this.#actions[actionName] !== "function") return;

    const value = this.#actions[possibleAction]
      ? parts.slice(1).join("#")
      : (fallbackValue ?? null);
    const result = this.#actions[actionName](element, {
      value,
      targetElement: element.dataset.target
    });

    if (result === false && event) event.preventDefault();

    Debug.log("…", "executed action", action, "on", element);

    return result;
  }
}

export default Events;
