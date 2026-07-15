import { describe, test, expect, beforeEach } from "vitest";
import inlineActions from "../../src/actions/inline.js";

describe("Inline Action", () => {
  let element;

  beforeEach(() => {
    document.body.innerHTML = '<div id="target"></div>';
    element = document.getElementById("target");
  });

  test("sets element textContent", () => {
    inlineActions.js(element, {
      value: "this.textContent = 'hello'",
      event: null
    });

    expect(element.textContent).toBe("hello");
  });

  test("this refers to the element", () => {
    element.dataset.value = "hello";

    const result = inlineActions.js(element, {
      value: "this.dataset.value",
      event: null
    });

    expect(result).toBe("hello");
  });

  test("event is passed to the expression", () => {
    const event = new MouseEvent("click");

    const result = inlineActions.js(element, {
      value: "event.type",
      event
    });

    expect(result).toBe("click");
  });

  test("returns undefined when expression evaluates to undefined", () => {
    const result = inlineActions.js(element, {
      value: "this.nonExistentProperty",
      event: null
    });

    expect(result).toBeUndefined();
  });

  test("propagates false return value from expression", () => {
    const result = inlineActions.js(element, {
      value: "false",
      event: null
    });

    expect(result).toBe(false);
  });

  test("throws on syntax error", () => {
    expect(() => {
      inlineActions.js(element, {
        value: "invalid ( syntax }",
        event: null
      });
    }).toThrow();
  });
});
