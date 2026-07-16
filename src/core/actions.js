import debounce from "./helpers/debounce";
import { actionAttributes, getActionAttributes } from "./attributes";

const debounceTimers = new WeakMap();

class Actions {
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

  #registry;
  #events;
  #eventTypes;
  #triggers;
  #listeners;
  #element;
  #scope;

  constructor(registry, events, eventTypes, triggers, listeners, element) {
    this.#registry = registry;
    this.#events = events;
    this.#eventTypes = eventTypes;
    this.#triggers = triggers;
    this.#listeners = listeners;
    this.#element = element;
    this.#scope = element;
  }

  prepare(element) {
    const attributes = getActionAttributes({ on: element });

    if (attributes.length === 0) return;

    this.#registerDirectListeners({ on: element, from: attributes });
    this.#registerDelegationListeners({ on: element, from: attributes });
    this.#setupDirectiveTriggers({ on: element, from: attributes });
  }

  process(event, context = null) {
    const element = context
      ? context.element
      : this.#actionElement(event.target);

    if (!element) return;

    if (!this.#scope.contains(element)) return;

    const delay = this.#debounceDelay(element);

    if (delay > 0) {
      let timer = debounceTimers.get(element);

      if (!timer) {
        timer = debounce();
        debounceTimers.set(element, timer);
      }

      timer(() => this.#execute({ event, with: context, on: element }), delay);

      return;
    }

    this.#execute({ event, with: context, on: element });
  }

  #debounceDelay(element) {
    return parseInt(
      element.dataset.debounce ??
        element.dataset.formDebounce ??
        element.dataset.requestDebounce ??
        0
    );
  }

  #execute({ event, with: context, on: element }) {
    if (!this.#scope.contains(element)) return;

    const defaultEventType = context
      ? context.eventType
      : this.#defaultEventType({ for: element });

    const attributes = getActionAttributes({ on: element });

    for (const { event: eventName, modifiers, value } of attributes) {
      const eventType = eventName !== null ? eventName : defaultEventType;

      if (eventType !== event.type) continue;

      if (this.#blockedByEventModifiers({ for: event, on: element, modifiers }))
        continue;

      this.#events.process(event, {
        on: element,
        using: defaultEventType,
        with: value
      });
    }
  }

  // private

  #blockedByEventModifiers({ for: event, on: element, modifiers }) {
    return modifiers.some((name) => {
      const eventModifier = this.#registry.getEventModifier(name);

      if (eventModifier) return eventModifier(event, element) === false;

      if (event.key === undefined) return false;

      return event.key.toLowerCase() !== name.toLowerCase();
    });
  }

  #registerDirectListeners({ on: element, from: attributes }) {
    for (const { event: eventName, modifiers, value } of attributes) {
      const eventType = eventName || this.#defaultEventType({ for: element });

      if (modifiers.includes("window") || modifiers.includes("document")) {
        const target = modifiers.includes("window") ? window : document;

        this.#listeners.addTargetedEventListener({
          for: eventType,
          on: target,
          element
        });

        continue;
      }

      if (Actions.#nonBubblingEvents.has(eventType)) {
        element.addEventListener(eventType, (event) =>
          this.#events.process(event, {
            on: element,
            using: this.#defaultEventType({ for: element }),
            with: value
          })
        );
      }
    }
  }

  #registerDelegationListeners({ on: element, from: attributes }) {
    const eventTypes = new Set();

    for (const { event: eventName, modifiers } of attributes) {
      if (modifiers.includes("window") || modifiers.includes("document"))
        continue;

      const eventType = eventName || this.#defaultEventType({ for: element });

      if (Actions.#nonBubblingEvents.has(eventType)) continue;

      eventTypes.add(eventType);
    }

    eventTypes.forEach((eventType) => {
      this.#listeners.addEventListeners({ for: eventType, on: this.#element });
    });
  }

  #setupDirectiveTriggers({ on: element, from: attributes }) {
    const directives = [
      ...new Set(
        attributes
          .filter(({ value }) => !value.startsWith("js:"))
          .flatMap(({ value }) =>
            value
              .split(" ")
              .filter((name) => name.includes(":"))
              .flatMap((name) => name.split(":").slice(1))
          )
      )
    ];

    const defaultEventType = this.#defaultEventType({ for: element });

    directives.forEach((name) => {
      this.#triggers.setup({
        for: name,
        on: element,
        trigger: () => {
          attributes.forEach(({ value }) => {
            this.#events.process(
              { type: name },
              {
                on: element,
                using: defaultEventType,
                triggeredBy: name,
                with: value
              }
            );
          });
        }
      });
    });
  }

  #defaultEventType({ for: element }) {
    return this.#eventTypes.getDefault({ from: element });
  }

  #actionElement(element) {
    while (element) {
      if (actionAttributes(element)) return element;

      element = element.parentElement;
    }

    return null;
  }
}

export default Actions;
