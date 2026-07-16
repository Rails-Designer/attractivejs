import Actions from "./actions";
import EventListeners from "./event_listeners";
import Observer from "./observer";
import Debug from "./../debug";

class Activation {
  #registry;
  #scope;
  #events;
  #eventTypes;
  #triggers;
  #listeners;
  #elementLifecycle;
  #subscriptions;
  #attributePrefixes;
  #owner;
  #actions;
  #observe;
  #initialized = false;

  constructor(dependencies) {
    this.#registry = dependencies.registry;
    this.#events = dependencies.events;
    this.#eventTypes = dependencies.eventTypes;
    this.#triggers = dependencies.triggers;
    this.#elementLifecycle = dependencies.elementLifecycle;
    this.#subscriptions = dependencies.subscriptions;
    this.#attributePrefixes = dependencies.attributePrefixes;
    this.#owner = dependencies.owner;
    this.#listeners = new EventListeners((event, context) =>
      this.#actions?.process(event, context)
    );
  }

  get active() {
    return this.#initialized;
  }

  activate(options = {}) {
    const {
      on = document,
      debug = false,
      extendWith = [],
      addActions = {},
      addGates = {},
      addTriggers = {}
    } = options;

    Debug.enabled = debug;

    if (!on) {
      Debug.error(
        "scope element not found: activate() requires a valid DOM element"
      );
      return this;
    }

    if (this.#initialized) return this;

    for (const [name, action] of Object.entries(addActions))
      this.#registry.addAction(name, action);

    for (const [name, action] of Object.entries(addGates))
      this.#registry.addGate(name, action);

    for (const [name, action] of Object.entries(addTriggers))
      this.#registry.addTrigger(name, action);

    this.#scope = on;
    this.#subscriptions.setScope(on);

    this.#actions = new Actions(
      this.#registry,
      this.#events,
      this.#eventTypes,
      this.#triggers,
      this.#listeners,
      on
    );

    this.#observe = new Observer(
      (element) => {
        this.#actions.prepare(element);

        this.#elementLifecycle.runAdded(element);
      },

      (element) => {
        this.#listeners.cleanup(element);

        this.#elementLifecycle.runRemoved(element);
      },

      on,
      (element) => {
        this.#elementLifecycle.runBeforeRemove(element);
      }
    );

    const elements = on.querySelectorAll("*");
    const actionElements = [];

    for (const element of elements) {
      if (this.#attributePrefixes.matches(element)) {
        actionElements.push(element);
      }
    }

    for (const extension of extendWith) {
      extension({ instance: this.#owner, registry: this.#registry });
    }

    actionElements.forEach((element) => {
      this.#actions.prepare(element);
    });

    this.#observe.start((element) => this.#attributePrefixes.matches(element));

    actionElements.forEach((element) => {
      this.#elementLifecycle.runAdded(element);
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
