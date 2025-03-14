import Events from "./core/events";
import EventTypes from "./core/event_types";
import Observer from "./core/observer";
import actions, { availableActions } from "./actions";
import Debug from "./debug";

class Attractive {
  #eventListeners = {};
  #events;
  #observe;

  constructor() {
    Debug.log("Initializing…");

    this.#events = new Events(actions);
    this.#observe = new Observer(element => this.#prepare(element));
  }

  activate(options = {}) {
    const { element = document } = options;

    this.element = element;
    this.#observe.start("[data-action]");
    this.element.querySelectorAll("[data-action]").forEach(element => this.#prepare(element));

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

    const registeredEventTypes = new Set(
      actionValue.includes("->")
        ? EventTypes.identify({ by: actionValue })
        : [EventTypes.getDefault({ from: element })]
    );

    registeredEventTypes.forEach(event => this.#addEventListeners({ for: event }));
  }

  #addEventListeners({ for: eventType }) {
    if (this.#eventListeners[eventType]) return;

    this.element.addEventListener(eventType, (event) => this.#process(event));

    Debug.log("Added event listener for", eventType, "to", this.element);

    this.#eventListeners[eventType] = true;
  }

  #process(event) {
    const element = event.target.closest("[data-action]");

    if (!element) return;

    const defaultEventType = EventTypes.getDefault({ from: element });

    this.#events.process(event, { on: element, using: defaultEventType });
  }
}

export default new Attractive();
