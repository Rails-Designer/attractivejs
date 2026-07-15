import { bindText, unbindText } from "./attribute.js";
import { setStore } from "./actions/set_store.js";
import { whenTrue, whenFalse, unbindStore } from "./directives.js";
import { store, has } from "./store.js";

export { store };

function js(element, { value: expression, event, target, targets }) {
  // eslint-disable-next-line no-new-func
  return new Function(
    "event",
    "target",
    "targets",
    "$store",
    `return ${expression}`
  ).call(element, event, target, targets, store);
}

export function reactive({ instance, registry }) {
  instance.store = store;

  registry.addAction("setStore", setStore);
  registry.addAction("js", js);
  registry.addDirective("whenTrue", whenTrue);
  registry.addDirective("whenFalse", whenFalse);

  instance.onElementAdded((element) => {
    const textKey = element.getAttribute("@text");

    if (textKey) {
      bindText({ on: element, with: textKey.trim() });
    }

    if (!element.value) return;
    if (!["INPUT", "SELECT", "TEXTAREA"].includes(element.tagName)) return;

    for (const attribute of element.attributes) {
      if (!attribute.name.startsWith("@")) continue;

      const setStorePrefix = "setStore#";
      if (!attribute.value.includes(setStorePrefix)) continue;

      const storeKey = attribute.value
        .slice(attribute.value.indexOf(setStorePrefix) + setStorePrefix.length)
        .split("=")[0];
      if (storeKey && !has(storeKey)) {
        store.set(storeKey, { with: element.value });
      }
    }
  });

  instance.onElementRemoved((element) => {
    unbindText(element);
    unbindStore(element);
  });
}
