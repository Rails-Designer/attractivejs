import Debug from "./../debug";
import deprecation from "./deprecation";

class Events {
  #registry;
  #prefix;
  #hooks;

  constructor(registry, prefix, hooks) {
    this.#registry = registry;
    this.#prefix = prefix;
    this.#hooks = hooks;
  }

  async process(
    event,
    { on: element, using: defaultEventType, triggeredBy: modifier }
  ) {
    if (!element) return;

    const actionValue = this.#getActionValue(element);

    if (!actionValue) return;

    for (const action of this.#splitActions(actionValue)) {
      const result = await this.#evaluate(action, {
        for: event,
        on: element,
        using: defaultEventType,
        triggeredBy: modifier
      });

      if (result === false) return false;
    }
  }

  // private

  #getActionValue(element) {
    const value = element.getAttribute(this.#prefix);

    if (value !== null) return value;

    if (element.hasAttribute("data-action")) {
      deprecation.warn("`data-action` is deprecated, use `on` instead.");
    }

    return element.getAttribute("data-action");
  }

  #getTargetValue(element) {
    const value = element.getAttribute(`${this.#prefix}-target`);

    if (value !== null) return value;

    const legacy = element.getAttribute("data-target");

    if (legacy !== null) {
      deprecation.warn("`data-target` is deprecated, use `on-target` instead.");
    }

    return legacy;
  }

  #getTargetsValue(element) {
    const value = element.getAttribute(`${this.#prefix}-targets`);

    if (value !== null) return value;

    const legacy = element.getAttribute("data-targets");

    if (legacy !== null) {
      deprecation.warn(
        "`data-targets` is deprecated, use `on-targets` instead."
      );
    }

    return legacy;
  }

  #splitActions(action) {
    return action.split(" ").filter((action) => action);
  }

  async #evaluate(
    action,
    { for: event, on: element, using: defaultEventType, triggeredBy: modifier }
  ) {
    let hasCustomEvent = false;

    if (action.includes("->")) {
      const [eventPart, actionPart] = action.split("->");
      const eventName = eventPart.includes("@")
        ? eventPart.split("@")[1]
        : eventPart;

      if (eventName !== event.type) return;

      action = actionPart;
      hasCustomEvent = true;
    }

    if (action.includes(":")) {
      const parts = action.split(":");
      const actionPart = parts[0];
      const modifiers = parts.slice(1);

      for (const rawModifier of modifiers) {
        const modifierFunction = this.#registry.getModifier(rawModifier);

        if (modifierFunction && modifierFunction.length === 1) {
          const result = modifierFunction({ event, element });

          if (!result) return;
        } else if (event.type !== rawModifier) {
          return;
        }
      }

      action = actionPart;
    } else if (!hasCustomEvent && event.type !== defaultEventType) {
      return;
    }

    return await this.#execute(action, {
      on: element,
      for: event,
      triggeredBy: modifier
    });
  }

  async #execute(action, { on: element, for: event, triggeredBy: modifier }) {
    const parts = action.split("#");
    const [possibleAction, fallbackAction, fallbackValue] = parts;
    const actionName = this.#registry.hasAction(possibleAction)
      ? possibleAction
      : this.#registry.hasAction(fallbackAction)
        ? fallbackAction
        : action;

    if (!this.#registry.isAllowed(actionName)) return;

    const actionFunction = this.#registry.getAction(actionName);
    if (typeof actionFunction !== "function") return;

    const value = this.#registry.hasAction(possibleAction)
      ? parts.slice(1).join("#")
      : (fallbackValue ?? null);

    const context = {
      name: actionName,
      element,
      options: {
        value,
        target: this.#getTargetValue(element),
        targets: this.#getTargetsValue(element)
      },

      event: event || null
    };

    const actionContext = {
      value,
      target: this.#getTargetValue(element),
      targets: this.#getTargetsValue(element),
      event: event || null,
      actionName,
      triggeredBy: modifier || null,
      dataset: element.dataset,
      dispatchEvent: (name, detail = {}) => {
        element.dispatchEvent(new CustomEvent(name, { detail, bubbles: true }));
      }
    };

    if (this.#hooks) {
      if (this.#hooks.runBefore(context) === false) {
        if (event) event.preventDefault();

        return false;
      }
    }

    const startTime = performance.now();

    let result;

    try {
      result = await actionFunction(element, actionContext);
    } catch (error) {
      const targetId = element.id || this.#getTargetValue(element) || "";

      Debug.error(
        `${actionName} on ${element.tagName.toLowerCase()}#${targetId}: ${error.message}`
      );

      if (this.#hooks) {
        this.#hooks.runError({ ...context, error });
      }

      throw error;
    }

    if (this.#hooks) {
      this.#hooks.runAfter({ ...context, result });
    }

    const elapsed = (performance.now() - startTime).toFixed(2);

    const targetId = element.id || this.#getTargetValue(element) || "";
    const target = targetId ? `#${targetId}` : "";
    const tag = element.tagName.toLowerCase();

    Debug.log(
      `${actionName} → ${tag}${target} (${elapsed}ms) [${event?.type}]`
    );

    if (result === false && event) event.preventDefault();

    return result;
  }
}

export default Events;
