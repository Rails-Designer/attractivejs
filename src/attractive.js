import Hooks from "./core/hooks";
import Registry from "./core/registry";
import Events from "./core/events";
import EventTypes from "./core/event_types";
import Directives from "./core/directives";
import Observer from "./core/observer";
import EventListeners from "./core/event_listeners";
import ActionController from "./core/action_controller";
import { actionAttributes } from "./core/attributes";
import Debug from "./debug";

class Attractive {
  #registry = new Registry();
  #events;
  #eventTypes;
  #directives;
  #observe;
  #listeners;
  #controller;
  #initialized = false;
  #hooks = new Hooks();

  static activate(options = {}) {
    const instance = new this(options);

    instance.activate(options);

    return instance;
  }

  /**
   * Toggle debug logging on or off.
   *
   * @param {boolean} value — true to enable debug output
   */
  static set debug(value) {
    Debug.enabled = value;
  }

  /**
   * Returns whether debug logging is enabled.
   *
   * @returns {boolean} — current debug state
   */
  static get debug() {
    return Debug.enabled;
  }

  get debug() {
    return Debug.enabled;
  }

  set debug(value) {
    Debug.enabled = value;
  }

  static onError(error, message, detail) {
    console.warn(`[attractive] ${message}`, error);

    if (typeof window.onerror === "function") {
      window.onerror(message, null, null, null, error);
    }
  }

  constructor(options = {}) {
    this.#events = new Events(
      this.#registry,
      this.#hooks,
      (error, message, detail) => Attractive.onError(error, message, detail)
    );
    this.#eventTypes = new EventTypes();
    this.#directives = new Directives(this.#registry);
    this.#listeners = new EventListeners((event, context) =>
      this.#controller.process(event, context)
    );
  }

  /**
   * Activates the Attractive instance on the given scope.
   *
   * @param {Object} [options] — activation options
   * @param {HTMLElement|Document} [options.on=document] — root element to observe
   * @param {boolean} [options.debug=false] — enable debug logging
   * @returns {Attractive} — the instance for chaining
   */
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

    this.#controller = new ActionController(
      this.#events,
      this.#eventTypes,
      this.#directives,
      this.#listeners,
      on
    );

    this.#observe = new Observer(
      (element) => this.#controller.prepare(element),
      (element) => this.#listeners.cleanup(element),
      on
    );

    this.#observe.start(actionAttributes);

    const elements = on.querySelectorAll("*");
    const actionElements = [];

    for (const element of elements) {
      if (actionAttributes(element)) {
        actionElements.push(element);
      }
    }

    actionElements.forEach((element) => this.#controller.prepare(element));

    this.#initialized = true;

    if (Debug.enabled) {
      Debug.log(
        `active — ${actionElements.length} element${actionElements.length === 1 ? "" : "s"} with actions`
      );
    }

    return this;
  }

  /**
   * Restricts available actions to the given names.
   *
   * @param {string[]} [actionNames] — action names to enable (all enabled if empty)
   * @returns {Attractive} — the instance for chaining
   */
  withActions(actionNames = []) {
    Debug.log("Initializing with actions", actionNames);

    if (actionNames.length > 0) {
      this.#registry.setActiveActions(new Set(actionNames));
    }

    return this;
  }

  /**
   * Adds a custom action.
   *
   * @param {string} name — action name used in `@action=""`
   * @param {Function} action — the action function
   * @returns {Attractive} — the instance for chaining
   */
  addAction(name, action) {
    this.#registry.addAction(name, action);

    return this;
  }

  /**
   * Adds a custom trigger.
   *
   * @param {string} name — trigger name used in `:name`
   * @param {Function} trigger — trigger function (element, fire)
   * @returns {Attractive} — the instance for chaining
   */
  addTrigger(name, trigger) {
    this.#registry.addDirective(name, trigger);

    return this;
  }

  /**
   * Adds a custom gate.
   *
   * @param {string} name — gate name used in `:name`
   * @param {Function} gate — gate function ({ event, element }) — return false to block
   * @returns {Attractive} — the instance for chaining
   */
  addGate(name, gate) {
    this.#registry.addDirective(name, gate);

    return this;
  }

  /**
   * Adds multiple actions at once.
   *
   * @param {Object<string, Function>} actions — object mapping action names to handler functions
   * @returns {Attractive} — the instance for chaining
   */
  addActions(actions) {
    Object.entries(actions).forEach(([name, action]) =>
      this.#registry.addAction(name, action)
    );

    return this;
  }

  /**
   * Adds multiple triggers at once.
   *
   * @param {Object<string, Function>} triggers — object mapping trigger names to trigger functions
   * @returns {Attractive} — the instance for chaining
   */
  addTriggers(triggers) {
    Object.entries(triggers).forEach(([name, fn]) =>
      this.#registry.addDirective(name, fn)
    );

    return this;
  }

  /**
   * Adds multiple gates at once.
   *
   * @param {Object<string, Function>} gates — object mapping gate names to gate functions
   * @returns {Attractive} — the instance for chaining
   */
  addGates(gates) {
    Object.entries(gates).forEach(([name, fn]) =>
      this.#registry.addDirective(name, fn)
    );

    return this;
  }

  /**
   * Registers a callback that runs before each action.
   * Return false to cancel the action.
   *
   * @param {Function} callback — receives { name, element, options, event }
   * @returns {Attractive} — the instance for chaining
   */
  onBeforeAction(callback) {
    this.#hooks.addBefore(callback);

    return this;
  }

  /**
   * Registers a callback that runs after each successful action.
   *
   * @param {Function} callback — receives { name, element, options, event, result }
   * @returns {Attractive} — the instance for chaining
   */
  onAfterAction(callback) {
    this.#hooks.addAfter(callback);

    return this;
  }

  /**
   * Registers a callback that runs when an action throws an error.
   *
   * @param {Function} callback — receives { name, element, options, event, error }
   * @returns {Attractive} — the instance for chaining
   */
  onError(callback) {
    this.#hooks.addError(callback);

    return this;
  }

  // private

  /**
   * Registers the default built-in actions.
   *
   * @param {Function} actionsLoader — receives the registry to register actions
   * @returns {Attractive} — the instance for chaining
   */
  registerActions(actionsLoader) {
    actionsLoader(this.#registry);

    return this;
  }

  /**
   * Registers the default built-in directives.
   *
   * @param {Function} directivesLoader — receives the registry to register directives
   * @returns {Attractive} — the instance for chaining
   */
  registerDirectives(directivesLoader) {
    directivesLoader(this.#registry);

    return this;
  }

  /**
   * Deactivates the instance, removing all event listeners and observer.
   *
   * @returns {Attractive} — the instance for chaining
   */
  deactivate() {
    if (!this.#initialized) return this;

    this.#listeners.removeAll();

    if (this.#observe) {
      this.#observe.stop();
    }

    this.#initialized = false;

    Debug.log("deactivated");

    return this;
  }

  /**
   * Deactivates and reactivates the instance with optional new options.
   *
   * @param {Object} [options] — same options as activate()
   * @returns {Attractive} — the instance for chaining
   */
  restart(options = {}) {
    this.deactivate();

    return this.activate(options);
  }
}

export default Attractive;
