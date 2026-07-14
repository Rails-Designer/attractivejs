import Debug from "./../debug";

class EventListeners {
  #eventListeners = new Map();
  #elementListeners = new WeakMap();
  #targetedEventListeners = new Map();
  #targetedEvents = new Map();
  #process;

  constructor(process) {
    this.#process = process;
  }

  addEventListeners({ for: eventType, on: element }) {
    if (this.#eventListeners.has(eventType)) return;

    const processEvent = (event) => this.#process(event);

    element.addEventListener(eventType, processEvent);

    Debug.log("Added event listener for", eventType, "to", element);

    this.#eventListeners.set(eventType, { listener: processEvent, element });
  }

  addTargetedEventListener({ for: eventType, on: target, element }) {
    const key = `${target === window ? "window" : "document"}:${eventType}`;

    if (!this.#elementListeners.has(element)) {
      this.#elementListeners.set(element, new Set());
    }
    this.#elementListeners.get(element).add(key);

    if (!this.#targetedEvents.has(key)) {
      this.#targetedEvents.set(key, new Set());
    }
    this.#targetedEvents.get(key).add(element);

    if (!this.#targetedEventListeners.has(key)) {
      const processElements = (event) => {
        const elements = this.#targetedEvents.get(key);

        if (!elements) return;

        elements.forEach((element) => {
          this.#process(event, { element, eventType });
        });
      };

      target.addEventListener(eventType, processElements);
      this.#targetedEventListeners.set(key, processElements);
    }
  }

  cleanup(element) {
    const keys = this.#elementListeners.get(element);

    if (!keys) return;

    keys.forEach((key) => {
      const events = this.#targetedEvents.get(key);

      if (events) {
        events.delete(element);

        if (events.size === 0) {
          const [targetName, eventType] = key.split(":");
          const listener = this.#targetedEventListeners.get(key);
          const target = targetName === "window" ? window : document;

          target.removeEventListener(eventType, listener);
          this.#targetedEventListeners.delete(key);
          this.#targetedEvents.delete(key);
        }
      }
    });

    this.#elementListeners.delete(element);
  }

  removeAll() {
    for (const [eventType, { listener, element }] of this.#eventListeners) {
      element.removeEventListener(eventType, listener);
    }

    this.#eventListeners.clear();

    for (const [key, listener] of this.#targetedEventListeners) {
      const [targetName, eventType] = key.split(":");
      const target = targetName === "window" ? window : document;

      target.removeEventListener(eventType, listener);
    }

    this.#targetedEventListeners.clear();
    this.#targetedEvents.clear();
    this.#elementListeners = new WeakMap();
  }
}

export default EventListeners;
