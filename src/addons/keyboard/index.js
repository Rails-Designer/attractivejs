import { hotkey } from "./hotkey.js";
import activeEditableElement from "./active_editable_element.js";

export const enter = (event) =>
  event.type === "hotkey" || event.key === "Enter";

export const escape = (event) =>
  event.type === "hotkey" || event.key === "Escape";

export const space = (event) => event.type === "hotkey" || event.key === " ";

export const tab = (event) => event.type === "hotkey" || event.key === "Tab";

export const arrowup = (event) =>
  event.type === "hotkey" || event.key === "ArrowUp";

export const arrowdown = (event) =>
  event.type === "hotkey" || event.key === "ArrowDown";

export const arrowleft = (event) =>
  event.type === "hotkey" || event.key === "ArrowLeft";

export const arrowright = (event) =>
  event.type === "hotkey" || event.key === "ArrowRight";

export const ctrl = (event) => event.type === "hotkey" || event.ctrlKey;

export const alt = (event) => event.type === "hotkey" || event.altKey;

export const shift = (event) => event.type === "hotkey" || event.shiftKey;

export const meta = (event) => event.type === "hotkey" || event.metaKey;

export function keyboard({ instance, registry }) {
  registry.addEventModifier("enter", enter);
  registry.addEventModifier("escape", escape);
  registry.addEventModifier("space", space);
  registry.addEventModifier("tab", tab);
  registry.addEventModifier("arrowup", arrowup);
  registry.addEventModifier("arrowdown", arrowdown);
  registry.addEventModifier("arrowleft", arrowleft);
  registry.addEventModifier("arrowright", arrowright);
  registry.addEventModifier("ctrl", ctrl);
  registry.addEventModifier("alt", alt);
  registry.addEventModifier("shift", shift);
  registry.addEventModifier("meta", meta);

  registry.addEventModifier("window", (event) => {
    if (event.type.startsWith("key") && activeEditableElement()) return false;
  });

  registry.addEventModifier("document", (event) => {
    if (event.type.startsWith("key") && activeEditableElement()) return false;
  });

  hotkey.setup(instance);
}
