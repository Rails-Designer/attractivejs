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

  constructor(registry, hooks, onError) {
    this.#evaluate = new Evaluate(registry);
    this.#execute = new Execute(
      registry,
      hooks,
      onError,
      (element) => getTargetValue(element),
      (element) => getTargetsValue(element)
    );
  }

  async process(
    event,
    { on: element, using: defaultEventType, triggeredBy: directive }
  ) {
    if (!element) return;

    const actionValue = getActionValue(element);

    if (!actionValue) return;

    for (const action of this.#splitActions(actionValue)) {
      const result = await this.#evaluate.run(
        action,
        {
          for: event,
          on: element,
          using: defaultEventType,
          triggeredBy: directive
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
