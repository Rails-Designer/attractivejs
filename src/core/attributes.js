import deprecation from "./deprecation";

const RESERVED = new Set([
  "@target",
  "@targets",
  "data-target",
  "data-targets"
]);

export function actionAttributes(element) {
  for (const attribute of element.attributes) {
    if (RESERVED.has(attribute.name)) continue;
    if (attribute.name.startsWith("@")) return true;
  }

  return element.hasAttribute("data-action");
}

export function getActionAttributes({ on: element }) {
  const attributes = [];

  for (const attribute of element.attributes) {
    if (RESERVED.has(attribute.name)) continue;

    if (attribute.name.startsWith("@")) {
      attributes.push(parseAttribute(attribute.name, attribute.value));
    }
  }

  if (attributes.length === 0 && element.hasAttribute("data-action")) {
    const value = element.getAttribute("data-action");
    if (value !== null) {
      deprecation.warn("`data-action` is deprecated, use `@action` instead.");

      attributes.push({ event: null, modifiers: [], value });
    }
  }

  return attributes;
}

function parseAttribute(name, value) {
  if (name === "@action" || name === "@") {
    return { event: null, modifiers: [], value };
  }

  const parts = name.slice(1).split(".");
  const event = parts[0];
  const modifiers = parts.slice(1);

  return { event, modifiers, value };
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
