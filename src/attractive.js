import Events from "./core/events";
import EventTypes from "./core/event_types";
import Observer from "./core/observer";
import Modifiers from "./core/modifiers";
import actions, { availableActions } from "./actions";
import Debug from "./debug";

class Attractive {
  #eventListeners = {};
  #elementListeners = new WeakMap();
  #targetedEventListeners = new Map();
  #events;
  #targetedEvents = new Map();
  #observe;

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

        this.#addTargetedEventListener(eventType, targetObject, element);
      });

    const modifiers = actions
      .filter(action => action.includes(":"))
      .map(action => action.split(":")[1]);

      modifiers.forEach(modifier => {
        Modifiers.setup({
          for: modifier,
          on: element,
          trigger: () => this.#events.process({ type: modifier }, { on: element, using: modifier })
        });
      });
  }

  #cleanup(element) {
    const keys = this.#elementListeners.get(element);

    if (!keys) return;

    keys.forEach(key => {
      const events = this.#targetedEvents.get(key);

      if (events) {
        events.delete(element);

        if (events.size === 0) {
          const [targetName, eventType] = key.split(":");
          const processElements = this.#targetedEventListeners.get(key);
          const target = targetName === "window" ? window : document;

          target.removeEventListener(eventType, processElements);
          this.#targetedEventListeners.delete(key);
          this.#targetedEvents.delete(key);
        }
      }
    });

    this.#elementListeners.delete(element);
  }

  #addEventListeners({ for: eventType }) {
    if (this.#eventListeners[eventType]) return;

    this.element.addEventListener(eventType, (event) => this.#process(event));

    Debug.log("Added event listener for", eventType, "to", this.element);

    this.#eventListeners[eventType] = true;
  }

  #addTargetedEventListener(eventType, target, element) {
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

        elements.forEach(element => {
          this.#events.process(event, { on: element, using: eventType });
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
