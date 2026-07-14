import { describe, test, expect, beforeEach, afterEach, vi } from "vitest";
import Attractive from "../../src/core.js";

const testOptions = {
  addActions: {
    noop: () => {}
  }
};

describe("beforeAction", () => {
  let attractive;

  beforeEach(() => {
    document.body.innerHTML = "";
    vi.clearAllTimers();
    vi.useFakeTimers();

    attractive = new Attractive();
  });

  afterEach(() => {
    attractive.deactivate();
  });

  test("fires callback with context", async () => {
    const callback = vi.fn();

    attractive.beforeAction(callback);
    attractive.activate(testOptions);

    document.body.innerHTML = `
      <button id="btn" @action="noop">Click</button>
    `;

    await vi.runAllTimersAsync();
    document.getElementById("btn").click();
    await vi.runAllTimersAsync();

    expect(callback).toHaveBeenCalledWith(
      expect.objectContaining({
        name: "noop",
        element: expect.any(HTMLElement),
        options: expect.any(Object),
        event: expect.any(MouseEvent)
      })
    );
  });

  test("fires multiple callbacks in order", async () => {
    const order = [];

    attractive.beforeAction(() => order.push("first"));
    attractive.beforeAction(() => order.push("second"));
    attractive.activate(testOptions);

    document.body.innerHTML = `
      <button id="btn" @action="noop">Click</button>
    `;

    await vi.runAllTimersAsync();
    document.getElementById("btn").click();
    await vi.runAllTimersAsync();

    expect(order).toEqual(["first", "second"]);
  });

  test("cancels action when callback returns false", async () => {
    const actionRan = vi.fn();

    attractive = new Attractive();
    attractive.beforeAction(() => false);

    attractive.activate({
      addActions: { guarded: actionRan }
    });

    document.body.innerHTML = `
      <button id="btn" @action="guarded">Click</button>
    `;

    await vi.runAllTimersAsync();
    document.getElementById("btn").click();
    await vi.runAllTimersAsync();

    expect(actionRan).not.toHaveBeenCalled();
  });

  test("does not call remaining callbacks after false", async () => {
    const afterCancelled = vi.fn();

    attractive.beforeAction(() => false);
    attractive.beforeAction(afterCancelled);
    attractive.activate(testOptions);

    document.body.innerHTML = `
      <button id="btn" @action="noop">Click</button>
    `;

    await vi.runAllTimersAsync();
    document.getElementById("btn").click();
    await vi.runAllTimersAsync();

    expect(afterCancelled).not.toHaveBeenCalled();
  });

  test("receives expected context properties", async () => {
    const callback = vi.fn();

    attractive.beforeAction(callback);
    attractive.activate(testOptions);

    document.body.innerHTML = `
      <button id="btn" @action="noop">Click</button>
    `;

    await vi.runAllTimersAsync();
    document.getElementById("btn").click();
    await vi.runAllTimersAsync();

    expect(callback).toHaveBeenCalledWith(
      expect.objectContaining({
        name: expect.any(String),
        element: expect.any(HTMLElement),
        options: expect.any(Object),
        event: expect.any(MouseEvent)
      })
    );
  });
});

describe("afterAction", () => {
  let attractive;

  beforeEach(() => {
    document.body.innerHTML = "";
    vi.clearAllTimers();
    vi.useFakeTimers();

    attractive = new Attractive();
  });

  afterEach(() => {
    attractive.deactivate();
  });

  test("fires callback with context and result", async () => {
    const callback = vi.fn();

    attractive.afterAction(callback);
    attractive.activate(testOptions);

    document.body.innerHTML = `
      <button id="btn" @action="noop">Click</button>
    `;

    await vi.runAllTimersAsync();
    document.getElementById("btn").click();
    await vi.runAllTimersAsync();

    expect(callback).toHaveBeenCalledWith(
      expect.objectContaining({
        name: "noop",
        element: expect.any(HTMLElement),
        options: expect.any(Object),
        result: undefined
      })
    );
  });
});

describe("onError", () => {
  let attractive;

  beforeEach(() => {
    document.body.innerHTML = "";
    vi.clearAllTimers();
    vi.useFakeTimers();

    attractive = new Attractive();
  });

  afterEach(() => {
    attractive.deactivate();
  });

  test("fires callback when action throws", async () => {
    const hook = vi.fn();
    const error = new Error("boom");

    attractive.onError(hook);

    attractive.activate({
      addActions: {
        thrower: () => {
          throw error;
        }
      }
    });

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
});
