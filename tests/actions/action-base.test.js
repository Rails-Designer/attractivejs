import { describe, test, expect, vi } from "vitest";
import Action from "../../src/action-class/index.js";

describe("Action base class", () => {
  function createAction(options = {}) {
    const element = document.createElement("button");
    element.dataset.color = "red";
    element.id = "test-btn";
    document.body.appendChild(element);

    const instance = new Action(element, { value: "hello", ...options });
    instance.currentElement = element;
    instance.options = { value: "hello", ...options };

    return { instance, element };
  }

  test("value getter returns options.value", () => {
    const { instance } = createAction();
    expect(instance.value).toBe("hello");
  });

  test("dataset getter returns element.dataset", () => {
    const { instance, element } = createAction();
    element.dataset.color = "blue";
    expect(instance.dataset.color).toBe("blue");
  });

  test("dispatchEvent fires a CustomEvent on currentElement", () => {
    const { instance, element } = createAction();

    const listener = vi.fn();
    element.addEventListener("test:done", listener);

    instance.dispatchEvent("test:done", { key: "value" });

    expect(listener).toHaveBeenCalledTimes(1);
    const event = listener.mock.calls[0][0];
    expect(event.type).toBe("test:done");
    expect(event.bubbles).toBe(true);
    expect(event.detail).toEqual({ key: "value" });
  });
});
