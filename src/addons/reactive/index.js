import { bindText, unbindText } from "./attribute.js";
import { setStore } from "./actions/set_store.js";
import { whenTrue, whenFalse, unbindStore } from "./directives.js";
import { store } from "./store.js";

export { store };

export function reactive({ instance, registry }) {
  instance.store = store;

  registry.addAction("setStore", setStore);
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
