import ActionController from "./action_controller";
import EventListeners from "./event_listeners";
import Observer from "./observer";
import Debug from "./../debug";

class Activation {
  #registry;
  #scope;
  #events;
  #eventTypes;
  #directives;
  #listeners;
  #elementLifecycle;
  #subscriptions;
  #attributePrefixes;
  #owner;
  #controller;
  #observe;
  #initialized = false;
  #extensions;

  constructor(dependencies) {
    this.#registry = dependencies.registry;
    this.#events = dependencies.events;
    this.#eventTypes = dependencies.eventTypes;
    this.#directives = dependencies.directives;
    this.#elementLifecycle = dependencies.elementLifecycle;
    this.#subscriptions = dependencies.subscriptions;
    this.#attributePrefixes = dependencies.attributePrefixes;
    this.#owner = dependencies.owner;
    this.#extensions = dependencies.extensions;
    this.#listeners = new EventListeners((event, context) =>
      this.#controller?.process(event, context)
    );
  }

  get active() {
    return this.#initialized;
  }

  activate(options = {}) {
    const { on = document, debug = false } = options;

    Debug.enabled = debug;

    if (!on) {
      Debug.error(
        "scope element not found: activate() requires a valid DOM element"
      );
      return this;
    }

    if (this.#initialized) return this;

    this.#scope = on;
    this.#subscriptions.setScope(on);

    this.#controller = new ActionController(
      this.#registry,
      this.#events,
      this.#eventTypes,
      this.#directives,
      this.#listeners,
      on
    );

    this.#observe = new Observer(
      (element) => {
        this.#controller.prepare(element);
        this.#elementLifecycle.fireAdded(element);
      },
      (element) => {
        this.#listeners.cleanup(element);
        this.#elementLifecycle.fireRemoved(element);
      },
      on,
      (element) => {
        this.#elementLifecycle.fireBeforeRemove(element);
      }
    );

    const elements = on.querySelectorAll("*");
    const actionElements = [];

    for (const element of elements) {
      if (this.#attributePrefixes.matches(element)) {
        actionElements.push(element);
      }
    }

    actionElements.forEach((element) => {
      this.#controller.prepare(element);
    });

    for (const extension of this.#extensions) {
      extension({ instance: this.#owner, registry: this.#registry });
    }

    this.#observe.start((element) => this.#attributePrefixes.matches(element));

    actionElements.forEach((element) => {
      this.#elementLifecycle.fireAdded(element);
    });

    this.#initialized = true;

    if (Debug.enabled) {
      Debug.log(
        `active — ${actionElements.length} element${actionElements.length === 1 ? "" : "s"} with actions`
      );
    }

    return this;
  }

  deactivate() {
    if (!this.#initialized) return this;

    this.#listeners.removeAll();

    if (this.#observe) {
      this.#observe.stop();
    }

    this.#subscriptions.removeAll();
    this.#elementLifecycle.clear();
    this.#attributePrefixes.clear();

    this.#initialized = false;

    Debug.log("deactivated");

    return this;
  }
}

export default Activation;
