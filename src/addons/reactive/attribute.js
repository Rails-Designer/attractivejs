import { store, has, subscribe } from "./store.js";

const bindings = new WeakMap();

export function bindText({ on: element, with: key }) {
  if (has(key)) {
    element.textContent = store.get(key) ?? "";
  } else {
    const value = element.textContent;

    if (value) store.set(key, { with: value });
  }

  const remove = subscribe(key, {
    with: (value) => {
      element.textContent = value === null || value === undefined ? "" : value;
    }
  });

  bindings.set(element, remove);
}

export function unbindText(element) {
  const remove = bindings.get(element);
  if (!remove) return;

  remove();
  bindings.delete(element);
}
