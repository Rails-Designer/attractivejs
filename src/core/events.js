import {
  getActionValue,
  getTargetValue,
  getTargetsValue
} from "./get_attribute";
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
      (element) => getTargetValue(element, this.#prefix),
      (element) => getTargetsValue(element, this.#prefix)
    );
    this.#prefix = prefix;
  }

  async process(
    event,
    { on: element, using: defaultEventType, triggeredBy: modifier }
  ) {
    if (!element) return;

    const actionValue = getActionValue(element, this.#prefix);

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

  #splitActions(action) {
    return action.split(" ").filter((action) => action);
  }
}

export default Events;
