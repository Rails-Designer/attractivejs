import { actionAttributes, getActionValue } from "./attributes";

class ActionController {
  static #nonBubblingEvents = new Set([
    "mouseenter",
    "mouseleave",
    "focus",
    "blur",
    "load",
    "error",
    "unload",
    "resize",
    "scroll"
  ]);

  #events;
  #eventTypes;
  #directives;
  #listeners;
  #element;
  #scope;

  constructor(events, eventTypes, directives, listeners, element) {
    this.#events = events;
    this.#eventTypes = eventTypes;
    this.#directives = directives;
    this.#listeners = listeners;
    this.#element = element;
    this.#scope = element;
  }

  // private

  prepare(element) {
    const actionValue = getActionValue(element);

    if (!actionValue) return;

    const actionNames = actionValue.split(" ");

    const registeredEventTypes = new Set(
      actionValue.includes("->")
        ? this.#eventTypes.identify({ by: actionValue })
        : [this.#eventTypes.getDefault({ from: element })]
    );

    registeredEventTypes.forEach((eventType) => {
      if (ActionController.#nonBubblingEvents.has(eventType)) {
        const processEvent = (event) => this.process(event);

        element.addEventListener(eventType, processEvent);
      } else {
        this.#listeners.addEventListeners({
          for: eventType,
          on: this.#element
        });
      }
    });

    actionNames
      .filter((action) => action.includes("@"))
      .forEach((action) => {
        const [eventPart] = action.split("->");
        const [target, eventType] = eventPart.split("@");
        const targetObject = target === "window" ? window : document;

        this.#listeners.addTargetedEventListener(
          eventType,
          targetObject,
          element
        );
      });

    const directives = [
      ...new Set(
        actionNames
          .filter((action) => action.includes(":"))
          .flatMap((action) => action.split(":").slice(1))
      )
    ];

    const defaultEventType = this.#eventTypes.getDefault({ from: element });

    directives.forEach((name) => {
      this.#directives.setup({
        for: name,
        on: element,
        trigger: () =>
          this.#events.process(
            { type: name },
            { on: element, using: defaultEventType, triggeredBy: name }
          )
      });
    });
  }

  process(event, context = null) {
    const element = context
      ? context.element
      : this.#actionElement(event.target);

    if (!element) return;

    if (!this.#scope.contains(element)) return;

    const defaultEventType = context
      ? context.eventType
      : this.#eventTypes.getDefault({ from: element });

    this.#events.process(event, {
      on: element,
      using: defaultEventType
    });
  }

  #actionElement(element) {
    while (element && element !== this.#scope) {
      if (actionAttributes(element)) return element;
      element = element.parentElement;
    }
    return null;
  }
}

export default ActionController;
