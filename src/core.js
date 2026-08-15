import Hooks from "./core/hooks";
import Registry from "./core/registry";
import Events from "./core/events";
import EventTypes from "./core/event_types";
import Triggers from "./core/triggers";
import ElementLifecycleHooks from "./core/element_lifecycle_hooks";
import EventSubscriptions from "./core/event_subscriptions";
import AttributePrefixes from "./core/attribute_prefixes";
import Activation from "./core/activation";
import { defaultEventModifier } from "./core/default_event_modifier";
import Debug from "./debug";

class Attractive {
  #registry = new Registry();
  #events;
  #eventTypes;
  #triggers;
  #activation;
  #hooks = new Hooks();
  #elementLifecycle = new ElementLifecycleHooks();
  #subscriptions = new EventSubscriptions();
  #attributePrefixes = new AttributePrefixes();

  static activate(options = {}) {
    const instance = new this(options);

    instance.activate(options);

    return instance;
  }

  /**
   * Returns whether debug logging is enabled.
   *
   * @returns {boolean} — current debug state
   */
  static get debug() {
    return Debug.enabled;
  }

  /**
   * Toggle debug logging on or off.
   *
   * @param {boolean} value — true to enable debug output
   */
  static set debug(value) {
    Debug.enabled = value;
  }

  get debug() {
    return Debug.enabled;
  }

  set debug(value) {
    Debug.enabled = value;
  }

  /**
   * Returns whether the instance is currently active.
   *
   * @returns {boolean} — true if activate() has been called and deactivate() has not
   */
  get active() {
    return this.#activation.active;
  }

  static onError(error, message) {
    console.warn(`[attractive] ${message}`, error);

    if (typeof window.onerror === "function") {
      window.onerror(message, null, null, null, error);
    }
  }

  constructor() {
    this.#events = new Events(
      this.#registry,
      this.#hooks,
      (error, message, detail) => Attractive.onError(error, message, detail)
    );
    this.#eventTypes = new EventTypes();
    this.#triggers = new Triggers(this.#registry);

    defaultEventModifier(this.#registry);

    this.#activation = new Activation({
      registry: this.#registry,
      events: this.#events,
      eventTypes: this.#eventTypes,
      triggers: this.#triggers,
      elementLifecycle: this.#elementLifecycle,
      subscriptions: this.#subscriptions,
      attributePrefixes: this.#attributePrefixes,
      owner: this
    });
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
    this.#activation.activate(options);

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
   * Registers a callback that runs before each action.
   * Return false to cancel the action.
   *
   * @param {Function} callback — receives { name, element, options, event }
   * @returns {Attractive} — the instance for chaining
   */
  beforeAction(callback) {
    this.#hooks.addBefore(callback);

    return this;
  }

  /**
   * Registers a callback that runs after each successful action.
   *
   * @param {Function} callback — receives { name, element, options, event, result }
   * @returns {Attractive} — the instance for chaining
   */
  afterAction(callback) {
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

  /**
   * Deactivates the instance, removing all event listeners and observer.
   *
   * @returns {Attractive} — the instance for chaining
   */
  deactivate() {
    this.#activation.deactivate();

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

  onElementAdded(callback) {
    this.#elementLifecycle.onAdded(callback);

    return this;
  }

  onElementRemoved(callback) {
    this.#elementLifecycle.onRemoved(callback);

    return this;
  }

  onBeforeElementRemoved(callback) {
    this.#elementLifecycle.onBeforeRemove(callback);

    return this;
  }

  onTargetConnected(id, callback) {
    this.#elementLifecycle.onTargetAdded(id, callback);
    this.#activation.notifyExistingTargets(id);

    return this;
  }

  onTargetDisconnected(id, callback) {
    this.#elementLifecycle.onTargetRemoved(id, callback);

    return this;
  }

  addEventListener(type, callback) {
    this.#subscriptions.add(type, callback);

    return this;
  }

  observeAttribute(prefix) {
    this.#attributePrefixes.add(prefix);

    return this;
  }
}

export default Attractive;
