import { describe, test, expect, beforeEach, vi } from "vitest";
import Attractive from "../src/index.js";
import builtinActions from "../src/actions/index.js";
import { defaultModifiers } from "../src/core/modifier_definitions.js";

globalThis.Node = globalThis.Node || { ELEMENT_NODE: 1 };

let app;

describe("Integration", () => {
  beforeEach(() => {
    document.body.innerHTML = "";
    vi.clearAllTimers();
    vi.useFakeTimers();
    app = new Attractive();
    app.registerActions((registry) => {
      Object.entries(builtinActions).forEach(([name, action]) =>
        registry.registerAction(name, action)
      );
    });
    app.registerModifiers((registry) => {
      defaultModifiers(registry);
    });
  });

  test("mounted modifier triggers addClass immediately when element is added to DOM", async () => {
    app.activate();

    document.body.innerHTML = `
      <div on="addClass#loaded:mounted" data-target="target">
        <span id="target">Target element</span>
      </div>
    `;

    await vi.runAllTimersAsync();

    const target = document.getElementById("target");
    expect(target.classList.contains("loaded")).toBe(true);
  });

  test("custom event types", async () => {
    app.activate();

    document.body.innerHTML = `
      <button id="trigger" on="mouseenter->addClass#hovered">Hover me</button>
    `;

    await vi.runAllTimersAsync();

    const trigger = document.getElementById("trigger");
    trigger.dispatchEvent(new MouseEvent("mouseenter", { bubbles: true }));

    expect(trigger.classList.contains("hovered")).toBe(true);
  });

  test("whenVisible modifier triggers when element becomes visible", async () => {
    const mockObserve = vi.fn();
    const mockDisconnect = vi.fn();

    global.IntersectionObserver = vi.fn().mockImplementation((_) => ({
      observe: mockObserve,
      disconnect: mockDisconnect
    }));

    app.activate();

    document.body.innerHTML = `
      <div on="addClass#visible:whenVisible" data-target="target">
        <span id="target">Target</span>
      </div>
    `;

    await vi.runAllTimersAsync();

    expect(mockObserve).toHaveBeenCalled();
  });

  test("fallback action syntax with hash", async () => {
    app.activate();

    document.body.innerHTML = `
      <button on="nonExistentAction#addClass#fallback:mounted" data-target="target">
        <div id="target">Target</div>
      </button>
    `;

    await vi.runAllTimersAsync();

    const target = document.getElementById("target");
    expect(target.classList.contains("fallback")).toBe(true);
  });

  test("once modifier allows action only on first click", async () => {
    app.activate();

    document.body.innerHTML = `
      <button id="btn" on="addClass#toggled:once" data-target="target">
        <span id="target">Target</span>
      </button>
    `;

    await vi.runAllTimersAsync();

    const target = document.getElementById("target");

    const button = document.getElementById("btn");
    button.click();
    expect(target.classList.contains("toggled")).toBe(true);

    button.click();
    const classListAfterSecond = target.classList.contains("toggled");
    expect(classListAfterSecond).toBe(true);
  });

  test("whenOutside gate blocks action when clicking inside element", async () => {
    app.activate();

    document.body.innerHTML = `
      <div id="outer" on="window@click->addClass#clicked:whenOutside" data-target="target">
        <div id="inner">Inside</div>
      </div>
      <span id="target">Target</span>
    `;

    await vi.runAllTimersAsync();

    const target = document.getElementById("target");

    document.getElementById("inner").click();
    expect(target.classList.contains("clicked")).toBe(false);
  });

  test("whenOutside gate allows action when clicking outside element", async () => {
    app.activate();

    document.body.innerHTML = `
      <div id="outer" on="window@click->addClass#clicked:whenOutside" data-target="target">
        <div id="inner">Inside</div>
      </div>
      <div id="outside">Outside</div>
      <span id="target">Target</span>
    `;

    await vi.runAllTimersAsync();

    const target = document.getElementById("target");

    document.getElementById("outside").click();
    expect(target.classList.contains("clicked")).toBe(true);
  });

  test("whenInView modifier triggers when element becomes visible", async () => {
    let observerCallback;

    global.IntersectionObserver = vi.fn().mockImplementation((callback) => {
      observerCallback = callback;

      return { observe: vi.fn(), disconnect: vi.fn() };
    });

    document.body.innerHTML = `
      <div on="addClass#visible:whenInView" data-target="target">
        <span id="target">Target</span>
      </div>
    `;

    await vi.runAllTimersAsync();

    if (observerCallback) {
      observerCallback([{ isIntersecting: true }]);
      await vi.runAllTimersAsync();
    }

    const target = document.getElementById("target");
    expect(target.classList.contains("visible")).toBe(true);
  });

  test("focus action focuses the target element", async () => {
    app.activate();

    document.body.innerHTML = `
      <button on="focus" data-target="inputField">Focus</button>
      <input id="inputField" type="text">
    `;

    await vi.runAllTimersAsync();

    const input = document.getElementById("inputField");
    const focusSpy = vi.spyOn(input, "focus");

    document.querySelector("button").click();

    expect(focusSpy).toHaveBeenCalled();
  });

  test("unregistered action name does not throw", async () => {
    app.activate();

    document.body.innerHTML = `
      <button on="nonExistentAction">Click me</button>
    `;

    await vi.runAllTimersAsync();

    expect(() => {
      document.querySelector("button").click();
    }).not.toThrow();
  });

  test("preventDefault modifier stops default browser behavior", async () => {
    app.activate();

    document.body.innerHTML = `
      <a href="https://example.com" on="addClass#clicked:preventDefault" data-target="target">Click me</a>
      <span id="target">Target</span>
    `;

    await vi.runAllTimersAsync();

    const target = document.getElementById("target");
    const link = document.querySelector("a");

    link.click();

    expect(target.classList.contains("clicked")).toBe(true);
  });

  test("deactivate removes event listeners", async () => {
    app.activate();

    document.body.innerHTML = `
      <button on="toggleClass#toggled" data-target="target">
        <span id="target">Target</span>
      </button>
    `;

    await vi.runAllTimersAsync();

    const target = document.getElementById("target");

    document.querySelector("button").click();
    expect(target.classList.contains("toggled")).toBe(true);

    app.deactivate();

    document.querySelector("button").click();
    expect(target.classList.contains("toggled")).toBe(true);
  });

  test("activate after deactivate works fresh", async () => {
    app.activate();

    document.body.innerHTML = `
      <button on="addClass#toggled" data-target="target">
        <span id="target">Target</span>
      </button>
    `;

    await vi.runAllTimersAsync();

    app.deactivate();

    document.body.innerHTML = "";
    vi.clearAllTimers();

    app.activate();

    document.body.innerHTML = `
      <button on="addClass#toggled" data-target="target">
        <span id="target">Target</span>
      </button>
    `;

    await vi.runAllTimersAsync();

    const target = document.getElementById("target");

    document.querySelector("button").click();

    expect(target.classList.contains("toggled")).toBe(true);
  });

  test("restart chains deactivate and activate", async () => {
    app.activate();

    document.body.innerHTML = `
      <button on="addClass#toggled" data-target="target">
        <span id="target">Target</span>
      </button>
    `;

    await vi.runAllTimersAsync();

    app.restart({ debug: true });

    document.querySelector("button").click();

    const target = document.getElementById("target");

    expect(target.classList.contains("toggled")).toBe(true);
  });

  test("async action resolves correctly", async () => {
    app.registerAction("asyncAction", async (element) => {
      const result = await Promise.resolve("done");

      element.dataset.asyncResult = result;
    });

    app.activate();

    document.body.innerHTML = `
      <button id="btn" on="asyncAction">Async</button>
    `;

    await vi.runAllTimersAsync();

    document.getElementById("btn").click();

    await vi.runAllTimersAsync();

    const button = document.getElementById("btn");

    expect(button.dataset.asyncResult).toBe("done");
  });

  test("false returned from async action prevents default", async () => {
    let actionCalled = false;

    app.registerAction("asyncPrevent", async () => {
      actionCalled = true;

      return false;
    });

    app.activate();

    document.body.innerHTML = `
      <button id="btn" on="asyncPrevent">Click</button>
    `;

    await vi.runAllTimersAsync();

    document.getElementById("btn").click();

    await vi.runAllTimersAsync();

    expect(actionCalled).toBe(true);
  });

  test("false short-circuits subsequent actions", async () => {
    const order = [];

    app.registerAction("first", async () => {
      order.push("first");

      return false;
    });

    app.registerAction("second", () => {
      order.push("second");
    });

    app.activate();

    document.body.innerHTML = `
      <button id="btn" on="first second">Multi</button>
    `;

    await vi.runAllTimersAsync();

    document.getElementById("btn").click();

    await vi.runAllTimersAsync();

    expect(order).toEqual(["first"]);
  });

  test("chained gate modifiers both evaluate correctly", async () => {
    let callCount = 0;

    app.registerAction("chainedTest", () => {
      callCount++;
    });

    app.activate();

    document.body.innerHTML = `
      <button id="btn" on="chainedTest:preventDefault">Click</button>
    `;

    await vi.runAllTimersAsync();

    document.getElementById("btn").click();

    await vi.runAllTimersAsync();

    expect(callCount).toBe(1);
  });

  test("chained with setup modifier still works", async () => {
    app.activate();

    document.body.innerHTML = `
      <button id="btn" on="addClass#loaded:mounted:once" data-target="target">Click</button>
      <span id="target">Target</span>
    `;

    await vi.runAllTimersAsync();

    const target = document.getElementById("target");
    expect(target.classList.contains("loaded")).toBe(true);
  });

  test("action context includes event for event-triggered actions", async () => {
    let receivedEvent;

    app.registerAction("captureEvent", (element, { event }) => {
      receivedEvent = event;
    });

    app.activate();

    document.body.innerHTML = `
      <button id="btn" on="captureEvent">Click</button>
    `;

    await vi.runAllTimersAsync();

    document.getElementById("btn").click();

    await vi.runAllTimersAsync();

    expect(receivedEvent).toBeInstanceOf(MouseEvent);
    expect(receivedEvent.type).toBe("click");
  });

  test("action context includes dataset", async () => {
    let receivedDataset;

    app.registerAction("captureDataset", (element, { dataset }) => {
      receivedDataset = dataset;
    });

    app.activate();

    document.body.innerHTML = `
      <button id="btn" on="captureDataset" data-custom="hello">Click</button>
    `;

    await vi.runAllTimersAsync();

    document.getElementById("btn").click();

    await vi.runAllTimersAsync();

    expect(receivedDataset.custom).toBe("hello");
  });

  test("dispatchEvent helper dispatches a CustomEvent", async () => {
    let capturedEvent;

    app.registerAction("dispatchTest", (element, { dispatchEvent }) => {
      element.addEventListener("test-event", (event) => {
        capturedEvent = event;
      });

      dispatchEvent("test-event", { key: "value" });
    });

    app.activate();

    document.body.innerHTML = `
      <button id="btn" on="dispatchTest">Click</button>
    `;

    await vi.runAllTimersAsync();

    document.getElementById("btn").click();

    await vi.runAllTimersAsync();

    expect(capturedEvent).toBeInstanceOf(CustomEvent);
    expect(capturedEvent.detail).toEqual({ key: "value" });
  });

  test("old-style handler destructuring still works", async () => {
    let receivedValue = null;

    app.registerAction("oldStyle", (element, { value }) => {
      receivedValue = value;
    });

    app.activate();

    document.body.innerHTML = `
      <button id="btn" on="oldStyle#hello">Click</button>
    `;

    await vi.runAllTimersAsync();

    document.getElementById("btn").click();

    await vi.runAllTimersAsync();

    expect(receivedValue).toBe("hello");
  });
});
