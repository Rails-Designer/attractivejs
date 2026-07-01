import { describe, test, expect, beforeEach, vi } from "vitest";
import Hooks from "../../src/core/hooks.js";

describe("Hooks", () => {
  let hooks;

  beforeEach(() => {
    hooks = new Hooks();
  });

  describe("addBefore / runBefore", () => {
    test("fires callback with context", () => {
      const callback = vi.fn();
      const context = { name: "test" };

      hooks.addBefore(callback);
      hooks.runBefore(context);

      expect(callback).toHaveBeenCalledWith(context);
    });

    test("fires multiple callbacks in order", () => {
      const order = [];
      const context = { name: "test" };

      hooks.addBefore(() => order.push("first"));
      hooks.addBefore(() => order.push("second"));
      hooks.runBefore(context);

      expect(order).toEqual(["first", "second"]);
    });

    test("returns false when a callback returns false", () => {
      hooks.addBefore(() => true);
      hooks.addBefore(() => false);
      hooks.addBefore(() => true);

      const result = hooks.runBefore({});

      expect(result).toBe(false);
    });

    test("does not call remaining callbacks after false", () => {
      const afterCancelled = vi.fn();

      hooks.addBefore(() => false);
      hooks.addBefore(afterCancelled);
      hooks.runBefore({});

      expect(afterCancelled).not.toHaveBeenCalled();
    });
  });

  describe("removeBefore", () => {
    test("removes a registered callback", () => {
      const callback = vi.fn();

      hooks.addBefore(callback);
      hooks.removeBefore(callback);
      hooks.runBefore({});

      expect(callback).not.toHaveBeenCalled();
    });

    test("does not throw when removing non-existent callback", () => {
      const callback = vi.fn();

      expect(() => hooks.removeBefore(callback)).not.toThrow();
    });
  });

  describe("addAfter / runAfter", () => {
    test("fires callback with context and result", () => {
      const callback = vi.fn();
      const context = { name: "test", result: "ok" };

      hooks.addAfter(callback);
      hooks.runAfter(context);

      expect(callback).toHaveBeenCalledWith(context);
    });
  });

  describe("addError / runError", () => {
    test("fires callback with context and error", () => {
      const callback = vi.fn();
      const context = { name: "test", error: new Error("fail") };

      hooks.addError(callback);
      hooks.runError(context);

      expect(callback).toHaveBeenCalledWith(context);
    });
  });

  describe("integration context shape", () => {
    test("runBefore receives expected context properties", () => {
      const callback = vi.fn();
      const context = {
        name: "toggleClass",
        element: document.createElement("div"),
        options: { value: "active", target: "foo", targets: null },
        event: new MouseEvent("click")
      };

      hooks.addBefore(callback);
      hooks.runBefore(context);

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
});
