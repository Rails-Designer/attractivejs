import Debug from "../../debug.js";
import { bindText, unbindText } from "./attribute.js";
import { setStore } from "./actions/set_store.js";
import { inStore, unbindInStore } from "./bridge.js";
import { store } from "./store.js";

export { store };

export function reactive({ instance, registry }) {
  instance.store = store;
  globalThis.$store = store;

  registry.addAction("setStore", setStore);
  registry.addTrigger("inStore", inStore);

  document
    .querySelectorAll('script[type="application/json"][data-store]')
    .forEach(hydrate);

  instance.onElementAdded((element) => {
    if (hydratedScript(element)) {
      hydrate(element);

      return;
    }

    const textKey = element.getAttribute("@text");
    if (textKey) bindText({ on: element, with: textKey.trim() });

    if (!element.value) return;
    if (!["INPUT", "SELECT", "TEXTAREA"].includes(element.tagName)) return;

    for (const attribute of element.attributes) {
      if (!attribute.name.startsWith("@")) continue;
      if (!attribute.value.includes("setStore#")) continue;

      const storeKey = attribute.value
        .slice(attribute.value.indexOf("setStore#") + "setStore#".length)
        .split("=")[0];

      if (storeKey && store.get(storeKey) === undefined)
        store.set(storeKey, element.value);
    }
  });

  instance.onElementRemoved((element) => {
    unbindText(element);

    unbindInStore(element);
  });
}

function hydratedScript(element) {
  return (
    element.tagName === "SCRIPT" &&
    element.type === "application/json" &&
    element.hasAttribute("data-store")
  );
}

function hydrate(script) {
  let data;

  try {
    data = JSON.parse(script.textContent);
  } catch {
    Debug.warn("Reactive: invalid hydration JSON");

    return;
  }

  for (const [key, value] of Object.entries(data)) store.set(key, value);
}
