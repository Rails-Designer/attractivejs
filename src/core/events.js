import Debug from "./../debug";

class Events {
  #actions;

  constructor(actions) {
    Debug.log("Events with actions:", Object.keys(actions));

    this.#actions = actions;
  }

  process(event, { on: element, using: defaultEventType }) {
    if (!element) return;

    const action = element.dataset.action;
    const actions = action.split(" ");

    actions.forEach(action => this.#evaluate(action, { for: event, on: element, using: defaultEventType }));
  }

  // private

  #evaluate(action, { for: event, on: element, using: defaultEventType }) {
    Debug.log("Process action for", event.type, "on", element, "…");

    if (action.includes("->")) {
      const [eventName, actionPart] = action.split("->");

      if (eventName !== event.type) return;

      this.#execute(actionPart, { on: element });
    } else if (event.type === defaultEventType) {
      this.#execute(action, { on: element });
    }

    Debug.log("…", "processed action for", event.type, "on", element);
  }

  #execute(action, { on: element }) {
    Debug.log("Execute action", action, "on", element, "…");

    const [actionName, value = null] = action.includes("#") ? action.split("#") : [action];

    if (!this.#actions[actionName] || typeof this.#actions[actionName] !== "function") return;

    const targetElement = element.dataset.target;

    this.#actions[actionName](element, { value: value, targetElement: targetElement });

    Debug.log("…", "executed action", action, "on", element);
  }
}

export default Events;
