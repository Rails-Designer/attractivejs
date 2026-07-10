import activeEditableElement, {
  editableElement
} from "./active_editable_element.js";
import Debug from "./../../debug";

const HOTKEY_PREFIX = "@hotkey.";

class Hotkey {
  #elements = new Set();
  #sequenceState = new Map();
  #modifierKeys = new Set(["ctrl", "alt", "shift", "meta"]);
  #heldKeys = new Set();
  #sequenceTimeout = 1500;
  #listening = false;

  setup(instance) {
    if (this.#listening) return;

    this.#listening = true;

    instance.onElementAdded((element) => {
      if (this.#hasHotkeyAttribute(element)) this.#elements.add(element);
    });

    instance.onElementRemoved((element) => {
      this.#elements.delete(element);
    });

    Array.from(document.querySelectorAll("*"))
      .filter((element) => this.#hasHotkeyAttribute(element))
      .forEach((element) => this.#elements.add(element));

    document.addEventListener("keyup", (event) => {
      this.#heldKeys.delete(event.key);
    });

    instance.addEventListener("keydown", (event) => {
      this.#heldKeys.add(event.key);

      if (!activeEditableElement()) {
        this.#process(event);
      }
    });
  }

  clearSequenceState() {
    this.#sequenceState.forEach((step) => clearTimeout(step.timeout));
    this.#sequenceState.clear();
  }

  // private

  #hasHotkeyAttribute(element) {
    return Array.from(element.attributes).some((attribute) =>
      attribute.name.startsWith(HOTKEY_PREFIX)
    );
  }

  #process(event) {
    let activated = false;

    for (const element of this.#elements) {
      if (this.#processElement({ for: event, on: element })) {
        activated = true;
      }
    }

    if (activated) {
      event.preventDefault();
      this.#heldKeys.clear();
    }
  }

  #processElement({ for: event, on: element }) {
    const hotkey = this.#hotkeyAttribute({ for: element });
    if (!hotkey) return false;

    const { modifiers, value } = hotkey;
    const combo = modifiers.some((part) => part.includes("+"));

    if (combo) {
      const keys = modifiers.flatMap((part) => part.split("+"));
      const systemKeys = keys.filter((key) => this.#modifierKeys.has(key));
      const triggerKeys = keys.filter((key) => !this.#modifierKeys.has(key));

      if (this.#matches({ for: event }, { systemKeys, triggerKeys })) {
        Debug.log("hotkey combo →", element);
        this.#activate({ on: element, with: value, path: modifiers });

        return true;
      }

      return false;
    }

    if (modifiers.length > 1) {
      return this.#matchSequence({
        for: event,
        on: element,
        sequence: modifiers,
        with: value
      });
    }

    if (event.key.toLowerCase() === modifiers[0].toLowerCase()) {
      this.#activate({ on: element, with: value, path: modifiers });

      return true;
    }

    return false;
  }

  #hotkeyAttribute({ for: element }) {
    const attribute = Array.from(element.attributes).find((attribute) =>
      attribute.name.startsWith(HOTKEY_PREFIX)
    );

    if (!attribute) return null;

    return {
      modifiers: attribute.name.slice(HOTKEY_PREFIX.length).split("."),
      value: attribute.value
    };
  }

  #matchSequence({ for: event, on: element, sequence, with: value }) {
    const step = this.#sequenceState.get(element);
    const expected = step ? sequence[step.position] : sequence[0];

    if (event.key.toLowerCase() !== expected) {
      this.#resetSequence({ on: element });

      return false;
    }

    if (!step) {
      this.#startSequence({ on: element, sequence });

      return false;
    }

    if (this.#heldKeys.has(sequence[step.position - 1])) {
      this.#resetSequence({ on: element });

      return false;
    }

    return this.#advanceSequence({
      for: event,
      on: element,
      step,
      sequence,
      with: value
    });
  }

  #matches({ for: event }, { systemKeys, triggerKeys }) {
    if (systemKeys.includes("ctrl") && !event.ctrlKey) return false;
    if (systemKeys.includes("alt") && !event.altKey) return false;
    if (systemKeys.includes("shift") && !event.shiftKey) return false;
    if (systemKeys.includes("meta") && !event.metaKey) return false;
    if (triggerKeys.some((key) => !this.#heldKeys.has(key))) return false;

    return true;
  }

  #activate({ on: element, with: value, path = [] }) {
    const tag = element.tagName.toLowerCase();
    const id = element.id ? `#${element.id}` : "";

    const delegateEvent = new CustomEvent("attractive:hotkey", {
      cancelable: true,
      detail: { path }
    });

    if (!element.dispatchEvent(delegateEvent)) return;

    if (editableElement(element)) {
      Debug.log(`hotkey → ${tag}${id} [focus]`);
      element.focus();
    } else if (value) {
      Debug.log(`hotkey → ${tag}${id} [${value}]`);
      element.dispatchEvent(new Event("hotkey", { bubbles: true }));
    } else {
      Debug.log(`hotkey → ${tag}${id} [click]`);
      element.click();
    }
  }

  #resetSequence({ on: element }) {
    const tag = element.tagName.toLowerCase();
    const id = element.id ? `#${element.id}` : "";

    Debug.log(`hotkey sequence reset → ${tag}${id}`);
    clearTimeout(this.#sequenceState.get(element)?.timeout);
    this.#sequenceState.delete(element);
  }

  #startSequence({ on: element, sequence }) {
    const tag = element.tagName.toLowerCase();
    const id = element.id ? `#${element.id}` : "";
    const keys = `${sequence[0]}→${sequence[1]}`;

    Debug.log(`hotkey sequence ${keys} → ${tag}${id}`);
    const timeout = setTimeout(
      () => this.#sequenceState.delete(element),
      this.#sequenceTimeout
    );

    this.#sequenceState.set(element, { position: 1, timeout });
  }

  #advanceSequence({ for: event, on: element, step, sequence, with: value }) {
    clearTimeout(step.timeout);

    step.position++;

    if (step.position >= sequence.length) {
      const tag = element.tagName.toLowerCase();
      const id = element.id ? `#${element.id}` : "";

      Debug.log(`hotkey sequence complete → ${tag}${id}`);
      this.#sequenceState.delete(element);
      this.#activate({ on: element, with: value, path: sequence });

      return true;
    }

    const tag = element.tagName.toLowerCase();
    const id = element.id ? `#${element.id}` : "";

    Debug.log(`hotkey sequence ${sequence[step.position]} → ${tag}${id}`);
    step.timeout = setTimeout(
      () => this.#sequenceState.delete(element),
      this.#sequenceTimeout
    );

    return false;
  }
}

export const hotkey = new Hotkey();
