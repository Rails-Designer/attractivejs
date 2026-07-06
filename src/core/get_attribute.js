import deprecation from "./deprecation";

export function actionAttributes(element) {
  return (
    element.hasAttribute("@action") ||
    element.hasAttribute("@") ||
    element.hasAttribute("data-action")
  );
}

export function getActionValue(element) {
  const value = element.getAttribute("@action");
  if (value !== null) return value;

  const shorthand = element.getAttribute("@");
  if (shorthand !== null) return shorthand;

  const legacy = element.getAttribute("data-action");
  if (legacy !== null) {
    deprecation.warn("`data-action` is deprecated, use `@action` instead.");
  }

  return legacy;
}

export function getTargetValue(element) {
  const value = element.getAttribute("@target");
  if (value !== null) return value;

  const legacy = element.getAttribute("data-target");
  if (legacy !== null) {
    deprecation.warn("`data-target` is deprecated, use `@target` instead.");
  }

  return legacy;
}

export function getTargetsValue(element) {
  const value = element.getAttribute("@targets");
  if (value !== null) return value;

  const legacy = element.getAttribute("data-targets");
  if (legacy !== null) {
    deprecation.warn("`data-targets` is deprecated, use `@targets` instead.");
  }

  return legacy;
}
