const SCOPE_PROPERTY = "__attractiveScope";

export function registerScope(root) {
  if (root && root.nodeType === 1 && !root[SCOPE_PROPERTY]) {
    Object.defineProperty(root, SCOPE_PROPERTY, {
      value: true,
      configurable: true
    });
  }
}

export function unregisterScope(root) {
  if (root && root.nodeType === 1 && root[SCOPE_PROPERTY]) {
    delete root[SCOPE_PROPERTY];
  }
}

export function insideNestedScope(element, scope) {
  let node = element;

  while (node && node.nodeType === 1 && node !== scope) {
    if (node[SCOPE_PROPERTY]) return true;

    node = node.parentElement;
  }

  return false;
}

export function scopeOf(element) {
  let node = element;

  while (node && node.nodeType === 1) {
    if (node[SCOPE_PROPERTY]) return node;

    node = node.parentElement;
  }

  return document;
}
