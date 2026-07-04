import deprecation from "./deprecation";

export function getActionValue(element, prefix) {
  const value = element.getAttribute(prefix);

  if (value !== null) return value;

  if (element.hasAttribute("data-action")) {
    deprecation.warn("`data-action` is deprecated, use `on` instead.");
  }

  return element.getAttribute("data-action");
}

export function getTargetValue(element, prefix) {
  const value = element.getAttribute(`${prefix}-target`);

  if (value !== null) return value;

  const legacy = element.getAttribute("data-target");

  if (legacy !== null) {
    deprecation.warn("`data-target` is deprecated, use `on-target` instead.");
  }

  return legacy;
}

export function getTargetsValue(element, prefix) {
  const value = element.getAttribute(`${prefix}-targets`);

  if (value !== null) return value;

  const legacy = element.getAttribute("data-targets");

  if (legacy !== null) {
    deprecation.warn("`data-targets` is deprecated, use `on-targets` instead.");
  }

  return legacy;
}
