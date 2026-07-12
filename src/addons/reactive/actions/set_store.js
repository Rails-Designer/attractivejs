import { store } from "../store.js";

export function setStore(element, { value: key }) {
  const tag = element.tagName;

  if (tag === "INPUT" || tag === "SELECT" || tag === "TEXTAREA") {
    store.set(key, { with: element.value });
  } else {
    store.set(key, { with: true });
  }
}
