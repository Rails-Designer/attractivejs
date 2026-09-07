import Debug from "../debug.js";
import { Template } from "./template.js";

export function respond(json, { registry }) {
  const actions = Array.isArray(json)
    ? json
    : json.actions
      ? json.actions
      : [json];

  for (const item of actions) {
    const [name, ...rest] = item.action.split("#");
    const value = rest.join("#");

    if (item.template) {
      if (!item.data) {
        Debug.warn(`Response: "template" without "data"`);
      } else {
        new Template(item.template).render({
          with: item.data,
          target: item.target,
          targets: item.targets,
          position: name
        });
      }

      continue;
    }

    const action = registry.getAction(name);
    if (!action) {
      Debug.warn(`Response: unknown action "${name}"`);

      continue;
    }

    const element = item.target
      ? document.getElementById(item.target)
      : item.targets
        ? document.querySelector(item.targets)
        : null;

    action(element, {
      value: value || item.value || null,
      target: item.target,
      targets: item.targets,
      dataset: {},
      data: item.data ?? null
    });
  }
}
