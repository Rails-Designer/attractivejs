import Hooks from "./core/hooks";
import Registry from "./core/registry";
import Events from "./core/events";
import EventTypes from "./core/event_types";
import Modifiers from "./core/modifiers";
import Observer from "./core/observer";
import EventListeners from "./core/event_listeners";
import ActionController from "./core/action_controller";
import Debug from "./debug";

let defaultPrefix = "on";

class Attractive {
  #registry = new Registry();
  #events;
  #eventTypes;
  #modifiers;
  #observe;
  #listeners;
  #controller;
  #initialized = false;
  #prefix;
  #hooks = new Hooks();

  static activate(options = {}) {
    const instance = new this(options);

    instance.activate(options);

    return instance;
  }

  /**
   * Configures the default prefix for all instances.
   *
   * @param {Object} options
   * @param {string} options.prefix — default attribute prefix (default: "on")
   */
  static configure(options = {}) {
    if (options.prefix) defaultPrefix = options.prefix;
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
    this.#prefix = options.prefix || defaultPrefix;

    this.#events = new Events(
      this.#registry,
      this.#prefix,
      this.#hooks,
      (error, message, detail) => Attractive.onError(error, message, detail)
    );
    this.#eventTypes = new EventTypes();
    this.#modifiers = new Modifiers(this.#registry);
    this.#listeners = new EventListeners((event, context) =>
      this.#controller.process(event, context)
    );
  }

  get actionAttribute() {
    return this.#prefix;
  }

  get targetAttribute() {
    return `${this.#prefix}-target`;
  }

  get targetsAttribute() {
    return `${this.#prefix}-targets`;
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
      this.#modifiers,
      this.#listeners,
      on,
      this.#prefix
    );

    this.#observe = new Observer(
      (element) => this.#controller.prepare(element),
      (element) => this.#listeners.cleanup(element),
      on
    );

    this.#observe.start(`[${this.actionAttribute}], [data-action]`);

    const elements = on.querySelectorAll(
      `[${this.actionAttribute}], [data-action]`
    );

    elements.forEach((element) => this.#controller.prepare(element));

    this.#initialized = true;

    if (Debug.enabled) {
      Debug.log(
        `active — ${elements.length} element${elements.length === 1 ? "" : "s"} with actions`
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
   * @param {string} name — action name used in `on=""`
   * @param {Function} action — the action function
   * @returns {Attractive} — the instance for chaining
   */
  addAction(name, action) {
    this.#registry.addAction(name, action);

    return this;
  }

  /**
   * Adds a custom modifier.
   *
   * @param {string} name — modifier name used in `:name`
   * @param {Function} setup — setup function (element, trigger) or gate function (context)
   * @returns {Attractive} — the instance for chaining
   */
  addModifier(name, setup) {
    this.#registry.addModifier(name, setup);

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
   * Adds multiple modifiers at once.
   *
   * @param {Object<string, Function>} modifiers — object mapping modifier names to setup/gate functions
   * @returns {Attractive} — the instance for chaining
   */
  addModifiers(modifiers) {
    Object.entries(modifiers).forEach(([name, setup]) =>
      this.#registry.addModifier(name, setup)
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
   * Registers the default built-in modifiers.
   *
   * @param {Function} modifiersLoader — receives the registry to register modifiers
   * @returns {Attractive} — the instance for chaining
   */
  registerModifiers(modifiersLoader) {
    modifiersLoader(this.#registry);

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
