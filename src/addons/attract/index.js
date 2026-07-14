import Debug from "../../debug.js";
import { append, prepend, replace, before, after, remove } from "./actions.js";
import { Form } from "./form.js";

const forms = new WeakMap();

export function attract({ instance, registry }) {
  if (!instance.store) {
    Debug.warn("Attract requires the reactive addon");

    return;
  }

  registry.addAction("append", append);
  registry.addAction("prepend", prepend);
  registry.addAction("replace", replace);
  registry.addAction("before", before);
  registry.addAction("after", after);
  registry.addAction("remove", remove);

  instance.onElementAdded((element) => {
    const attract = element.getAttribute("@attract");

    if (element.tagName === "FORM" && attract !== null) {
      if (forms.has(element)) return;

      const cleanup = new Form({ form: element, registry }).submit();
      forms.set(element, cleanup);

      return;
    }

    if (attract !== null) {
      element.querySelectorAll("form").forEach((form) => {
        if (forms.has(form)) return;

        const cleanup = new Form({ form, registry }).submit();
        forms.set(form, cleanup);
      });
    }
  });

  instance.onElementRemoved((element) => {
    const cleanup = forms.get(element);

    if (cleanup) {
      cleanup();

      forms.delete(element);
    }
  });
}
