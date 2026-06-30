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
  #modifiers;
  #listeners;
  #element;

  constructor(events, eventTypes, modifiers, listeners, element) {
    this.#events = events;
    this.#eventTypes = eventTypes;
    this.#modifiers = modifiers;
    this.#listeners = listeners;
    this.#element = element;
  }

  prepare(element) {
    const actionValue = element.dataset.action;

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

    const modifierNames = actionNames
      .filter((action) => action.includes(":"))
      .map((action) => action.split(":")[1]);

    const defaultEventType = this.#eventTypes.getDefault({ from: element });

    modifierNames.forEach((modifier) => {
      this.#modifiers.setup({
        for: modifier,
        on: element,
        trigger: () =>
          this.#events.process(
            { type: modifier },
            { on: element, using: defaultEventType }
          )
      });
    });
  }

  process(event, context = null) {
    const element = context
      ? context.element
      : event.target.closest("[data-action]");

    if (!element) return;

    const defaultEventType = context
      ? context.eventType
      : this.#eventTypes.getDefault({ from: element });

    this.#events.process(event, { on: element, using: defaultEventType });
  }
}

export default ActionController;
