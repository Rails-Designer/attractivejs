import { store } from "../store.js";

export function setStore(element, { value: source }) {
  let key = source;
  let value = true;
  const parts = key.split("=");

  if (parts.length > 1) {
    value = parts.slice(1).join("=");
    key = parts[0];
  }

  if (!element) {
    store.set(key, { with: value });
    return;
  }

  const tag = element.tagName;

  if (tag === "INPUT" || tag === "SELECT" || tag === "TEXTAREA") {
    store.set(key, { with: element.value });
  } else {
    store.set(key, { with: value });
  }
}
