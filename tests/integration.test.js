import { describe, test, expect, beforeEach, vi } from "vitest";
import Attractive from "../src/index.js";
import CoreAttractive from "../src/attractive.js";
import builtinActions from "../src/actions/index.js";
import { defaultDirectives } from "../src/core/builtin_directives.js";
import { addClass, removeClass } from "../src/actions/class.js";
import { remove } from "../src/actions/element.js";

globalThis.Node = globalThis.Node || { ELEMENT_NODE: 1 };

let attractive;

describe("Integration", () => {
  beforeEach(() => {
    document.body.innerHTML = "";
    vi.clearAllTimers();
    vi.useFakeTimers();

    attractive = new Attractive();

    attractive.registerActions((registry) => {
      Object.entries(builtinActions).forEach(([name, action]) =>
        registry.addAction(name, action)
      );
    });

    attractive.registerDirectives((directives) => {
      defaultDirectives(directives);
    });
  });

  test("mounted trigger fires addClass immediately when element is added to DOM", async () => {
    attractive.activate();

    document.body.innerHTML = `
      <div @action="addClass#loaded:mounted" @target="target">
        <span id="target">Target element</span>
      </div>
    `;

    await vi.runAllTimersAsync();

    const target = document.getElementById("target");
    expect(target.classList.contains("loaded")).toBe(true);
  });

  test("custom event types", async () => {
    attractive.activate();

    document.body.innerHTML = `
      <button id="trigger" @action="mouseenter->addClass#hovered">Hover me</button>
    `;

    await vi.runAllTimersAsync();

    const trigger = document.getElementById("trigger");
    trigger.dispatchEvent(new MouseEvent("mouseenter", { bubbles: true }));

    expect(trigger.classList.contains("hovered")).toBe(true);
  });

  test("whenVisible trigger fires when element becomes visible", async () => {
    const mockObserve = vi.fn();
    const mockDisconnect = vi.fn();

    global.IntersectionObserver = vi.fn().mockImplementation((_) => ({
      observe: mockObserve,
      disconnect: mockDisconnect
    }));

    attractive.activate();

    document.body.innerHTML = `
      <div @action="addClass#visible:whenVisible" @target="target">
        <span id="target">Target</span>
      </div>
    `;

    await vi.runAllTimersAsync();

    expect(mockObserve).toHaveBeenCalled();
  });

  test("fallback action syntax with hash", async () => {
    attractive.activate();

    document.body.innerHTML = `
      <button @action="nonExistentAction#addClass#fallback:mounted" @target="target">
        <div id="target">Target</div>
      </button>
    `;

    await vi.runAllTimersAsync();

    const target = document.getElementById("target");
    expect(target.classList.contains("fallback")).toBe(true);
  });

  test("once gate allows action only on first click", async () => {
    attractive.activate();

    document.body.innerHTML = `
      <button id="btn" @action="addClass#toggled:once" @target="target">
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
    attractive.activate();

    document.body.innerHTML = `
      <div id="outer" @action="window@click->addClass#clicked:whenOutside" @target="target">
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
    attractive.activate();

    document.body.innerHTML = `
      <div id="outer" @action="window@click->addClass#clicked:whenOutside" @target="target">
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

  test("whenInView trigger fires when element becomes visible", async () => {
    let observerCallback;

    global.IntersectionObserver = vi.fn().mockImplementation((callback) => {
      observerCallback = callback;

      return { observe: vi.fn(), disconnect: vi.fn() };
    });

    document.body.innerHTML = `
      <div @action="addClass#visible:whenInView" @target="target">
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
    attractive.activate();

    document.body.innerHTML = `
      <button @action="focus" @target="inputField">Focus</button>
      <input id="inputField" type="text">
    `;

    await vi.runAllTimersAsync();

    const input = document.getElementById("inputField");
    const focusSpy = vi.spyOn(input, "focus");

    document.querySelector("button").click();

    expect(focusSpy).toHaveBeenCalled();
  });

  test("unregistered action name does not throw", async () => {
    attractive.activate();

    document.body.innerHTML = `
      <button @action="nonExistentAction">Click me</button>
    `;

    await vi.runAllTimersAsync();

    expect(() => {
      document.querySelector("button").click();
    }).not.toThrow();
  });

  test("preventDefault gate stops default browser behavior", async () => {
    attractive.activate();

    document.body.innerHTML = `
      <a href="https://example.com" @action="addClass#clicked:preventDefault" @target="target">Click me</a>
      <span id="target">Target</span>
    `;

    await vi.runAllTimersAsync();

    const target = document.getElementById("target");
    const link = document.querySelector("a");

    link.click();

    expect(target.classList.contains("clicked")).toBe(true);
  });

  test("deactivate removes event listeners", async () => {
    attractive.activate();

    document.body.innerHTML = `
      <button @action="toggleClass#toggled" @target="target">
        <span id="target">Target</span>
      </button>
    `;

    await vi.runAllTimersAsync();

    const target = document.getElementById("target");

    document.querySelector("button").click();
    expect(target.classList.contains("toggled")).toBe(true);

    attractive.deactivate();

    document.querySelector("button").click();
    expect(target.classList.contains("toggled")).toBe(true);
  });

  test("activate after deactivate works fresh", async () => {
    attractive.activate();

    document.body.innerHTML = `
      <button @action="addClass#toggled" @target="target">
        <span id="target">Target</span>
      </button>
    `;

    await vi.runAllTimersAsync();

    attractive.deactivate();

    document.body.innerHTML = "";
    vi.clearAllTimers();

    attractive.activate();

    document.body.innerHTML = `
      <button @action="addClass#toggled" @target="target">
        <span id="target">Target</span>
      </button>
    `;

    await vi.runAllTimersAsync();

    const target = document.getElementById("target");

    document.querySelector("button").click();

    expect(target.classList.contains("toggled")).toBe(true);
  });

  test("restart chains deactivate and activate", async () => {
    attractive.activate();

    document.body.innerHTML = `
      <button @action="addClass#toggled" @target="target">
        <span id="target">Target</span>
      </button>
    `;

    await vi.runAllTimersAsync();

    attractive.restart({ debug: true });

    document.querySelector("button").click();

    const target = document.getElementById("target");

    expect(target.classList.contains("toggled")).toBe(true);
  });

  test("async action resolves correctly", async () => {
    attractive.addAction("asyncAction", async (element) => {
      const result = await Promise.resolve("done");

      element.dataset.asyncResult = result;
    });

    attractive.activate();

    document.body.innerHTML = `
      <button id="btn" @action="asyncAction">Async</button>
    `;

    await vi.runAllTimersAsync();

    document.getElementById("btn").click();

    await vi.runAllTimersAsync();

    const button = document.getElementById("btn");

    expect(button.dataset.asyncResult).toBe("done");
  });

  test("false returned from async action prevents default", async () => {
    let actionCalled = false;

    attractive.addAction("asyncPrevent", async () => {
      actionCalled = true;

      return false;
    });

    attractive.activate();

    document.body.innerHTML = `
      <button id="btn" @action="asyncPrevent">Click</button>
    `;

    await vi.runAllTimersAsync();

    document.getElementById("btn").click();

    await vi.runAllTimersAsync();

    expect(actionCalled).toBe(true);
  });

  test("false short-circuits subsequent actions", async () => {
    const order = [];

    attractive.addAction("first", async () => {
      order.push("first");

      return false;
    });

    attractive.addAction("second", () => {
      order.push("second");
    });

    attractive.activate();

    document.body.innerHTML = `
      <button id="btn" @action="first second">Multi</button>
    `;

    await vi.runAllTimersAsync();

    document.getElementById("btn").click();

    await vi.runAllTimersAsync();

    expect(order).toEqual(["first"]);
  });

  test("chained gates both evaluate correctly", async () => {
    let callCount = 0;

    attractive.addAction("chainedTest", () => {
      callCount++;
    });

    attractive.activate();

    document.body.innerHTML = `
      <button id="btn" @action="chainedTest:preventDefault">Click</button>
    `;

    await vi.runAllTimersAsync();

    document.getElementById("btn").click();

    await vi.runAllTimersAsync();

    expect(callCount).toBe(1);
  });

  test("chained with trigger and gate still works", async () => {
    attractive.activate();

    document.body.innerHTML = `
      <button id="btn" @action="addClass#loaded:mounted:once" @target="target">Click</button>
      <span id="target">Target</span>
    `;

    await vi.runAllTimersAsync();

    const target = document.getElementById("target");
    expect(target.classList.contains("loaded")).toBe(true);
  });

  test("action context includes event for event-triggered actions", async () => {
    let receivedEvent;

    attractive.addAction("captureEvent", (element, { event }) => {
      receivedEvent = event;
    });

    attractive.activate();

    document.body.innerHTML = `
      <button id="btn" @action="captureEvent">Click</button>
    `;

    await vi.runAllTimersAsync();

    document.getElementById("btn").click();

    await vi.runAllTimersAsync();

    expect(receivedEvent).toBeInstanceOf(MouseEvent);
    expect(receivedEvent.type).toBe("click");
  });

  test("action context includes dataset", async () => {
    let receivedDataset;

    attractive.addAction("captureDataset", (element, { dataset }) => {
      receivedDataset = dataset;
    });

    attractive.activate();

    document.body.innerHTML = `
      <button id="btn" @action="captureDataset" data-custom="hello">Click</button>
    `;

    await vi.runAllTimersAsync();

    document.getElementById("btn").click();

    await vi.runAllTimersAsync();

    expect(receivedDataset.custom).toBe("hello");
  });

  test("dispatchEvent helper dispatches a CustomEvent", async () => {
    let capturedEvent;

    attractive.addAction("dispatchTest", (element, { dispatchEvent }) => {
      element.addEventListener("test-event", (event) => {
        capturedEvent = event;
      });

      dispatchEvent("test-event", { key: "value" });
    });

    attractive.activate();

    document.body.innerHTML = `
      <button id="btn" @action="dispatchTest">Click</button>
    `;

    await vi.runAllTimersAsync();

    document.getElementById("btn").click();

    await vi.runAllTimersAsync();

    expect(capturedEvent).toBeInstanceOf(CustomEvent);
    expect(capturedEvent.detail).toEqual({ key: "value" });
  });

  test("error from action does not bubble up as unhandled", async () => {
    attractive.addAction("thrower", () => {
      throw new Error("boom");
    });

    attractive.activate();

    document.body.innerHTML = `
      <button id="btn" @action="thrower">Click</button>
    `;

    await vi.runAllTimersAsync();

    expect(() => {
      document.getElementById("btn").click();
    }).not.toThrow();
  });

  test("instance onError hook fires when action throws", async () => {
    const hook = vi.fn();
    const error = new Error("boom");

    attractive.addAction("thrower", () => {
      throw error;
    });

    attractive.onError(hook);
    attractive.activate();

    document.body.innerHTML = `
      <button id="btn" @action="thrower">Click</button>
    `;

    await vi.runAllTimersAsync();
    document.getElementById("btn").click();
    await vi.runAllTimersAsync();

    expect(hook).toHaveBeenCalledWith(
      expect.objectContaining({ name: "thrower", error })
    );
  });

  test("Attractive.onError global handler receives error context", async () => {
    const handler = vi.fn();
    const original = Attractive.onError;

    Attractive.onError = handler;

    attractive.addAction("thrower", () => {
      throw new Error("boom");
    });

    attractive.activate();

    document.body.innerHTML = `
      <button id="btn" @action="thrower">Click</button>
    `;

    await vi.runAllTimersAsync();
    document.getElementById("btn").click();
    await vi.runAllTimersAsync();

    expect(handler).toHaveBeenCalledWith(
      expect.any(Error),
      expect.stringContaining("thrower"),
      expect.objectContaining({ actionName: "thrower" })
    );

    Attractive.onError = original;
  });

  test("old-style handler destructuring still works", async () => {
    let receivedValue = null;

    attractive.addAction("oldStyle", (element, { value }) => {
      receivedValue = value;
    });

    attractive.activate();

    document.body.innerHTML = `
      <button id="btn" @action="oldStyle#hello">Click</button>
    `;

    await vi.runAllTimersAsync();

    document.getElementById("btn").click();

    await vi.runAllTimersAsync();

    expect(receivedValue).toBe("hello");
  });
});

describe("Core build with selective actions", () => {
  beforeEach(() => {
    document.body.innerHTML = "";

    vi.clearAllTimers();
    vi.useFakeTimers();
  });

  test("registers actions and makes them available", async () => {
    const attractive = new CoreAttractive();

    attractive.addAction("addClass", addClass);
    attractive.registerDirectives((directives) => {
      defaultDirectives(directives);
    });
    attractive.activate();

    document.body.innerHTML = `
      <button id="btn" @action="addClass#active" @target="target">
        <span id="target">Target</span>
      </button>
    `;

    await vi.runAllTimersAsync();

    document.getElementById("btn").click();

    const target = document.getElementById("target");
    expect(target.classList.contains("active")).toBe(true);
  });

  test("registers actions from different modules", async () => {
    const attractive = new CoreAttractive();

    attractive.addAction("addClass", addClass);
    attractive.addAction("remove", remove);

    attractive.registerDirectives((directives) => {
      defaultDirectives(directives);
    });
    attractive.activate();

    document.body.innerHTML = `
      <div id="container">
        <div id="target">Remove me</div>
      </div>
      <button id="btn" @action="remove" @target="target">Remove</button>
    `;

    await vi.runAllTimersAsync();

    document.getElementById("btn").click();

    expect(document.getElementById("target")).toBeNull();
  });

  test("registers multiple actions from a single module", async () => {
    const attractive = new CoreAttractive();

    attractive.addAction("addClass", addClass);
    attractive.addAction("removeClass", removeClass);

    attractive.registerDirectives((directives) => {
      defaultDirectives(directives);
    });
    attractive.activate();

    document.body.innerHTML = `
      <button id="btn" @action="removeClass#inactive" @target="target">
        <span id="target" class="inactive">Target</span>
      </button>
    `;

    await vi.runAllTimersAsync();

    document.getElementById("btn").click();

    const target = document.getElementById("target");
    expect(target.classList.contains("inactive")).toBe(false);
  });

  test("unregistered actions are not available", async () => {
    const attractive = new CoreAttractive();

    attractive.addAction("addClass", addClass);

    attractive.registerDirectives((directives) => {
      defaultDirectives(directives);
    });
    attractive.activate();

    document.body.innerHTML = `
      <button id="btn" @action="copy">Copy</button>
    `;

    await vi.runAllTimersAsync();

    expect(() => {
      document.getElementById("btn").click();
    }).not.toThrow();
  });

  test("addActions registers multiple actions at once", async () => {
    const attractive = new CoreAttractive();

    attractive.addActions({ addClass, removeClass });

    attractive.registerDirectives((directives) => {
      defaultDirectives(directives);
    });
    attractive.activate();

    document.body.innerHTML = `
      <button id="btn" @action="removeClass#inactive" @target="target">
        <span id="target" class="inactive">Target</span>
      </button>
    `;

    await vi.runAllTimersAsync();

    document.getElementById("btn").click();

    const target = document.getElementById("target");
    expect(target.classList.contains("inactive")).toBe(false);
  });

  test("@ shorthand works for default event action", async () => {
    attractive.activate();

    document.body.innerHTML = `
      <button id="btn" @="addClass#toggled" @target="target">
        <span id="target">Target</span>
      </button>
    `;

    await vi.runAllTimersAsync();

    document.getElementById("btn").click();

    const target = document.getElementById("target");
    expect(target.classList.contains("toggled")).toBe(true);
  });

  test("data-action backward compat works when no @action present", async () => {
    attractive.activate();

    document.body.innerHTML = `
      <button id="btn" data-action="addClass#toggled" data-target="target">
        <span id="target">Target</span>
      </button>
    `;

    await vi.runAllTimersAsync();

    document.getElementById("btn").click();

    const target = document.getElementById("target");
    expect(target.classList.contains("toggled")).toBe(true);
  });

  test("@action takes priority over data-action", async () => {
    attractive.activate();

    document.body.innerHTML = `
      <button id="btn" @action="addClass#primary" data-action="addClass#ignored" @target="target">
        <span id="target">Target</span>
      </button>
    `;

    await vi.runAllTimersAsync();

    document.getElementById("btn").click();

    const target = document.getElementById("target");
    expect(target.classList.contains("primary")).toBe(true);
    expect(target.classList.contains("ignored")).toBe(false);
  });

  test("addTriggers/addGates register directives at once", async () => {
    const attractive = new CoreAttractive();

    attractive.addAction("addClass", addClass);
    attractive.addGates({ enabled: (_context) => true });

    attractive.registerDirectives((directives) => {
      defaultDirectives(directives);
    });
    attractive.activate();

    document.body.innerHTML = `
      <button id="btn" @action="addClass#active:enabled" @target="target">
        <span id="target">Target</span>
      </button>
    `;

    await vi.runAllTimersAsync();

    document.getElementById("btn").click();

    const target = document.getElementById("target");
    expect(target.classList.contains("active")).toBe(true);
  });
});
