import { store } from "../store.js";

function coerced(value) {
  if (value === "true") return true;
  if (value === "false") return false;
  if (value === "null") return null;
  if (value !== "" && !Number.isNaN(Number(value))) return Number(value);

  return value;
}

export function setStore(element, { value: raw, data }) {
  let key = raw;
  let explicitValue = false;
  let value = true;

  const parts = key.split("=");
  if (parts.length > 1) {
    explicitValue = true;
    value = parts.slice(1).join("=");
    key = parts[0];
  }

  if (data !== undefined && data !== null) {
    store.set(key, data);

    return;
  }

  if (!element) {
    store.set(key, explicitValue ? coerced(value) : true);

    return;
  }

  const tag = element.tagName;

  if (tag === "INPUT" || tag === "SELECT" || tag === "TEXTAREA") {
    store.set(key, element.value);
  } else {
    store.set(key, explicitValue ? coerced(value) : true);
  }
}
