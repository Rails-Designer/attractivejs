import builtinActions from "../actions";

export function defaultActions(registry) {
  Object.entries(builtinActions).forEach(([name, action]) =>
    registry.registerAction(name, action)
  );
}
