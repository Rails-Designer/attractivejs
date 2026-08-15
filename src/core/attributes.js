const RESERVED = new Set(["@target", "@targets"]);

export function actionAttributes(element) {
  if (!element || !element.attributes) return false;

  for (const attribute of element.attributes) {
    if (RESERVED.has(attribute.name)) continue;
    if (attribute.name.startsWith("@")) return true;
  }

  return false;
}

export function getActionAttributes({ on: element }) {
  const attributes = [];

  for (const attribute of element.attributes) {
    if (RESERVED.has(attribute.name)) continue;

    if (attribute.name.startsWith("@")) {
      attributes.push(parseAttribute(attribute.name, attribute.value));
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
  const modifiers = parts.slice(1).flatMap((part) => part.split("+"));

  return { event, modifiers, value };
}

export function getTargetValue(element) {
  return element.getAttribute("@target");
}

export function getTargetsValue(element) {
  return element.getAttribute("@targets");
}
