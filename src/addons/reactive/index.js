import { bindText, unbindText } from "./attribute.js";
import { setStore } from "./actions/set_store.js";
import { whenTrue, whenFalse, unbindStore } from "./directives.js";
import { store } from "./store.js";

export { store };

function js(element, { value: expression, event, target, targets }) {
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
    const key = element.getAttribute("@text");

    if (!key) return;

    bindText({ on: element, with: key.trim() });
  });

  instance.onElementRemoved((element) => {
    unbindText(element);
    unbindStore(element);
  });
}
