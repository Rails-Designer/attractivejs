import deprecation from "./deprecation";

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
  #prefix;
  #scope;

  constructor(events, eventTypes, modifiers, listeners, element, prefix) {
    this.#events = events;
    this.#eventTypes = eventTypes;
    this.#modifiers = modifiers;
    this.#listeners = listeners;
    this.#element = element;
    this.#prefix = prefix;
    this.#scope = element;
  }

  // private

  #getActionValue(element) {
    const value = element.getAttribute(this.#prefix);

    if (value !== null) return value;

    if (element.hasAttribute("data-action")) {
      deprecation.warn("`data-action` is deprecated, use `on` instead.");
    }

    return element.getAttribute("data-action");
  }

  #getTargetValue(element) {
    const value = element.getAttribute(`${this.#prefix}-target`);

    if (value !== null) return value;

    const legacy = element.getAttribute("data-target");

    if (legacy !== null) {
      deprecation.warn("`data-target` is deprecated, use `on-target` instead.");
    }

    return legacy;
  }

  #getTargetsValue(element) {
    const value = element.getAttribute(`${this.#prefix}-targets`);

    if (value !== null) return value;

    const legacy = element.getAttribute("data-targets");

    if (legacy !== null) {
      deprecation.warn(
        "`data-targets` is deprecated, use `on-targets` instead."
      );
    }

    return legacy;
  }

  prepare(element) {
    const actionValue = this.#getActionValue(element);

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

    const modifierNames = [
      ...new Set(
        actionNames
          .filter((action) => action.includes(":"))
          .flatMap((action) => action.split(":").slice(1))
      )
    ];

    const defaultEventType = this.#eventTypes.getDefault({ from: element });

    modifierNames.forEach((modifier) => {
      this.#modifiers.setup({
        for: modifier,
        on: element,
        trigger: () =>
          this.#events.process(
            { type: modifier },
            { on: element, using: defaultEventType, triggeredBy: modifier }
          )
      });
    });
  }

  process(event, context = null) {
    const element = context
      ? context.element
      : event.target.closest(`[${this.#prefix}], [data-action]`);

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
}

export default ActionController;
