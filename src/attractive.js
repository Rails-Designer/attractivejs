import Registry from "./core/Registry";
import Events from "./core/events";
import EventTypes from "./core/event_types";
import Modifiers from "./core/modifiers";
import Observer from "./core/observer";
import EventListeners from "./core/event_listeners";
import ActionController from "./core/action_controller";
import { defaultModifiers } from "./core/modifier_definitions";
import { defaultActions } from "./core/action_definitions";
import Debug from "./debug";

class Attractive {
  #registry = new Registry();
  #events;
  #eventTypes;
  #modifiers;
  #observe;
  #listeners;
  #controller;
  #initialized = false;

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

  constructor() {
    this.#events = new Events(this.#registry);
    this.#eventTypes = new EventTypes(this.#registry);
    this.#modifiers = new Modifiers(this.#registry);
    this.#listeners = new EventListeners((event, context) =>
      this.#controller.process(event, context)
    );

    this.#registerActions();
    this.#registerModifiers();
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

    if (this.#initialized) return this;

    this.#controller = new ActionController(
      this.#events,
      this.#eventTypes,
      this.#modifiers,
      this.#listeners,
      on
    );

    this.#observe = new Observer(
      (element) => this.#controller.prepare(element),
      (element) => this.#listeners.cleanup(element)
    );

    this.#observe.start("[data-action]");

    const elements = on.querySelectorAll("[data-action]");

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
   * Restricts available actions to the given groups.
   *
   * @param {string[]} [groups] — action group names to enable
   * @returns {Attractive} — the instance for chaining
   */
  withActions(groups = []) {
    Debug.log("Initializing with actions", groups);

    return this;
  }

  /**
   * Registers a plugin that provides actions, modifiers, or event types.
   *
   * @param {Object} plugin
   * @param {string} plugin.name — plugin identifier
   * @param {Object<string, Function>} [plugin.actions] — action name to handler map
   * @param {Object<string, Function>} [plugin.modifiers] — modifier name to setup/gate function map
   * @param {Object<string, string>} [plugin.eventTypeOverrides] — tag name to event type map
   * @param {Function} [plugin.init] — called after registration with the instance
   * @returns {Attractive} — the instance for chaining
   */
  use(plugin) {
    if (plugin.actions) {
      Object.entries(plugin.actions).forEach(([name, action]) =>
        this.#registry.registerAction(name, action)
      );
    }

    if (plugin.modifiers) {
      Object.entries(plugin.modifiers).forEach(([name, setup]) =>
        this.#registry.registerModifier(name, setup)
      );
    }

    if (plugin.eventTypeOverrides) {
      Object.entries(plugin.eventTypeOverrides).forEach(([tag, event]) =>
        this.#registry.registerEventTypeOverride(tag, event)
      );
    }

    if (plugin.init) {
      plugin.init(this);
    }

    return this;
  }

  /**
   * Registers a custom action.
   *
   * @param {string} name — action name used in `on=""`
   * @param {Function} action — the action function
   * @returns {Attractive} — the instance for chaining
   */
  registerAction(name, action) {
    this.#registry.registerAction(name, action);

    return this;
  }

  /**
   * Registers a custom modifier.
   *
   * @param {string} name — modifier name used in `:name`
   * @param {Function} setup — setup function (element, trigger) or gate function (context)
   * @returns {Attractive} — the instance for chaining
   */
  registerModifier(name, setup) {
    this.#registry.registerModifier(name, setup);

    return this;
  }

  // private

  #registerActions() {
    defaultActions(this.#registry);
  }

  #registerModifiers() {
    defaultModifiers(this.#registry);
  }
}

export default new Attractive();
