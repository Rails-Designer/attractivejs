import { describe, test, expect } from "vitest";
import Events from "../../src/core/events.js";
import Registry from "../../src/core/registry.js";

function setup() {
  const registry = new Registry();
  let captured = null;

  registry.registerAction("testAction", function (element, context) {
    captured = context;
  });

  const events = new Events(registry, "on", null);

  return { events, getContext: () => captured };
}

describe("Action context", () => {
  test("passes event to action function", () => {
    const { events, getContext } = setup();
    const button = document.createElement("button");

    button.setAttribute("on", "testAction");

    events.process(new MouseEvent("click"), { on: button, using: "click" });

    expect(getContext()).toBeDefined();
    expect(getContext().event).toBeInstanceOf(MouseEvent);
  });

  test("includes dataset", () => {
    const { events, getContext } = setup();
    const button = document.createElement("button");

    button.setAttribute("on", "testAction");
    button.setAttribute("data-role", "admin");

    events.process(new MouseEvent("click"), { on: button, using: "click" });

    expect(getContext().dataset.role).toBe("admin");
  });

  test("includes dispatchEvent helper", () => {
    const { events, getContext } = setup();
    const button = document.createElement("button");

    button.setAttribute("on", "testAction");

    events.process(new MouseEvent("click"), { on: button, using: "click" });

    expect(typeof getContext().dispatchEvent).toBe("function");
  });

  test("dispatchEvent dispatches a CustomEvent", () => {
    const { events, getContext } = setup();
    const button = document.createElement("button");

    button.setAttribute("on", "testAction");

    let capturedDetail;

    button.addEventListener("app-event", (event) => {
      capturedDetail = event.detail;
    });

    events.process(new MouseEvent("click"), { on: button, using: "click" });

    getContext().dispatchEvent("app-event", { key: "value" });

    expect(capturedDetail).toEqual({ key: "value" });
  });

  test("triggeredBy is null for direct events", () => {
    const { events, getContext } = setup();
    const button = document.createElement("button");

    button.setAttribute("on", "testAction");

    events.process(new MouseEvent("click"), { on: button, using: "click" });

    expect(getContext().triggeredBy).toBeNull();
  });

  test("old-style destructuring of value still works", () => {
    const { events, getContext } = setup();
    const button = document.createElement("button");

    button.setAttribute("on", "testAction#hello");

    events.process(new MouseEvent("click"), { on: button, using: "click" });

    expect(getContext().value).toBe("hello");
  });

  test("includes actionName", () => {
    const { events, getContext } = setup();
    const button = document.createElement("button");

    button.setAttribute("on", "testAction");

    events.process(new MouseEvent("click"), { on: button, using: "click" });

    expect(getContext().actionName).toBe("testAction");
  });
});
