import deprecation from "./deprecation";
import Evaluate from "./events/evaluate";
import Execute from "./events/execute";

class Events {
  #evaluate;
  #execute;
  #prefix;

  constructor(registry, prefix, hooks, onError) {
    this.#evaluate = new Evaluate(registry);
    this.#execute = new Execute(
      registry,
      hooks,
      onError,
      (element) => this.#getTargetValue(element),
      (element) => this.#getTargetsValue(element)
    );
    this.#prefix = prefix;
  }

  async process(
    event,
    { on: element, using: defaultEventType, triggeredBy: modifier }
  ) {
    if (!element) return;

    const actionValue = this.#getActionValue(element);

    if (!actionValue) return;

    for (const action of this.#splitActions(actionValue)) {
      const result = await this.#evaluate.run(
        action,
        {
          for: event,
          on: element,
          using: defaultEventType,
          triggeredBy: modifier
        },
        { execute: (action, context) => this.#execute.run(action, context) }
      );

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
}

export default Events;
