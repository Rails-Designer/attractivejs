export function js(element, { value: expression, event, target, targets }) {
  // eslint-disable-next-line no-new-func
  return new Function(
    "event",
    "target",
    "targets",
    `return ${expression}`
  ).call(element, event, target, targets);
}

const actions = { js };

export default actions;

export const jsAction = {
  name: "js",
  actions
};
