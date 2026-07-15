import Debug from "./../../debug";

class Execute {
  #registry;
  #hooks;
  #onError;
  #getTargetValue;
  #getTargetsValue;

  constructor(registry, hooks, onError, getTargetValue, getTargetsValue) {
    this.#registry = registry;
    this.#hooks = hooks;
    this.#onError = onError;
    this.#getTargetValue = getTargetValue;
    this.#getTargetsValue = getTargetsValue;
  }

  async run(
    action,
    { with: { on: element, for: event, triggeredBy: directive } }
  ) {
    const resolved = this.#resolve({ from: action });
    if (resolved === undefined) return;

    const { name, value } = resolved;
    const target = this.#getTargetValue(element);
    const targets = this.#getTargetsValue(element);

    const hookContext = this.#hookContext({
      name,
      value,
      on: element,
      for: event,
      target,
      targets
    });

    const actionContext = this.#actionContext({
      name,
      value,
      on: element,
      for: event,
      target,
      targets,
      triggeredBy: directive
    });

    if (this.#hooks?.runBefore(hookContext) === false) {
      event?.preventDefault();
      return false;
    }

    const startTime = performance.now();
    const result = await this.#invoke({
      name,
      on: element,
      context: actionContext
    });
    const elapsed = performance.now() - startTime;

    this.#hooks?.runAfter({ ...hookContext, result });
    this.#log({ name, on: element, for: event, elapsed, target });

    if (result === false && event) event.preventDefault();

    return result;
  }

  // private

  #resolve({ from: action }) {
    if (action.startsWith("js:")) {
      return { name: "js", value: action.slice(3) };
    }

    const parts = action.split("#");
    const [possibleAction, fallbackAction, fallbackValue] = parts;

    const name = this.#registry.hasAction(possibleAction)
      ? possibleAction
      : this.#registry.hasAction(fallbackAction)
        ? fallbackAction
        : action;

    if (!this.#registry.isAllowed(name)) return;
    if (typeof this.#registry.getAction(name) !== "function") return;

    const value = this.#registry.hasAction(possibleAction)
      ? parts.slice(1).join("#")
      : (fallbackValue ?? null);

    return { name, value };
  }

  #hookContext({ name, value, on: element, for: event, target, targets }) {
    return {
      name,
      element,
      options: { value, target, targets },
      event: event || null
    };
  }

  #actionContext({
    name,
    value,
    on: element,
    for: event,
    target,
    targets,
    triggeredBy: directive
  }) {
    return {
      value,
      target,
      targets,
      event: event || null,
      actionName: name,
      triggeredBy: directive || null,
      dataset: element.dataset
    };
  }

  async #invoke({ name, on: element, context: actionContext }) {
    try {
      const actionFunction = this.#registry.getAction(name);

      return await actionFunction(element, actionContext);
    } catch (error) {
      this.#reportError({ name, on: element, error });
    }
  }

  #reportError({ name: actionName, on: element, error }) {
    const targetId = element.id || this.#getTargetValue(element) || "";
    const message = `${actionName} on ${element.tagName.toLowerCase()}#${targetId}: ${error.message}`;

    Debug.error(message);

    if (this.#hooks) {
      this.#hooks.runError({ name: actionName, element, error });
    }

    if (this.#onError) {
      this.#onError(error, message, { actionName, element });
    }
  }

  #log({ name, on: element, for: event, elapsed, target }) {
    const targetId = element.id || target || "";
    const ref = targetId ? `#${targetId}` : "";
    const tag = element.tagName.toLowerCase();

    Debug.log(
      `${name} → ${tag}${ref} (${elapsed.toFixed(2)}ms) [${event?.type}]`
    );
  }
}

export default Execute;
