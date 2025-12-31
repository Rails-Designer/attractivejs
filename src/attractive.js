import Events from "./core/events";
import EventTypes from "./core/event_types";
import Observer from "./core/observer";
import actions, { availableActions } from "./actions";
import Debug from "./debug";

class Attractive {
  #eventListeners = {};
  #events;
  #observe;
  #elementListeners = new WeakMap();
  #targetedEventListeners = new Map();

  static get debug() {
    return Debug.enabled;
  }

  static set debug(value) {
    Debug.enabled = value;
  }

  constructor() {
    this.#events = new Events(actions);
    this.#observe = new Observer(
      (element) => this.#prepare(element),
      (element) => this.#cleanup(element)
    );
  }

  activate(options = {}) {
    const { on = document, debug = false } = options;

    Debug.enabled = debug;
    Debug.log("Initializing…");

    this.element = on;
    this.#observe.start("[data-action]");
    this.element
      .querySelectorAll("[data-action]")
      .forEach((element) => this.#prepare(element));

    Debug.log("…initialized");

    return this;
  }

  withActions(actions = []) {
    Debug.log("Initializing with actions", actions);

    this.#events = new Events(availableActions(actions));

    return this;
  }

  // private

  #prepare(element) {
    const actionValue = element.dataset.action;

    if (!actionValue) return;

    const actions = actionValue.split(" ");

    const registeredEventTypes = new Set(
      actionValue.includes("->")
        ? EventTypes.identify({ by: actionValue })
        : [EventTypes.getDefault({ from: element })]
    );

    registeredEventTypes.forEach((event) =>
      this.#addEventListeners({ for: event })
    );

    actions
      .filter((action) => action.includes("@"))
      .forEach((action) => {
        const [eventPart] = action.split("->");
        const [target, eventType] = eventPart.split("@");
        const targetObject = target === "window" ? window : document;

        this.#addTargetedEventListener(eventType, targetObject, element, action);
      });
  }

  #cleanup(element) {
    const keys = this.#elementListeners.get(element);

    if (!keys) return;

    keys.forEach(key => {
      const [targetName, eventType] = key.split(":");
      const stillNeeded = Array.from(document.querySelectorAll("[data-action]"))
        .some(element => this.#elementListeners.get(element)?.has(key));

      if (stillNeeded) return;

      const processableElements = this.#targetedEventListeners.get(key);
      const target = targetName === "window" ? window : document;

      target.removeEventListener(eventType, processableElements);
      this.#targetedEventListeners.delete(key);
    });

    this.#elementListeners.delete(element);
  }

  #addEventListeners({ for: eventType }) {
    if (this.#eventListeners[eventType]) return;

    this.element.addEventListener(eventType, (event) => this.#process(event));

    Debug.log("Added event listener for", eventType, "to", this.element);

    this.#eventListeners[eventType] = true;
  }

  #addTargetedEventListener(eventType, target, element, action) {
    const key = `${target === window ? "window" : "document"}:${eventType}`;

    if (!this.#elementListeners.has(element)) {
      this.#elementListeners.set(element, new Set());
    }
    this.#elementListeners.get(element).add(key);

    if (!this.#targetedEventListeners.has(key)) {
      const processElements = (event) => {
        document.querySelectorAll("[data-action]").forEach(element => {
          if (element.dataset.action.includes(action.split("->")[0])) {
            this.#events.process(event, { on: element, using: eventType });
          }
        });
      };

      target.addEventListener(eventType, processElements);
      this.#targetedEventListeners.set(key, processElements);
    }
  }

  #process(event) {
    const element = event.target.closest("[data-action]");

    if (!element) return;

    const defaultEventType = EventTypes.getDefault({ from: element });

    this.#events.process(event, { on: element, using: defaultEventType });
  }
}

export default new Attractive();
