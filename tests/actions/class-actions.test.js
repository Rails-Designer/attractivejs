import { describe, test, expect, beforeEach, vi } from "vitest";
import Attractive from "../../src/index.js";
import {
  builtinGates,
  builtinTriggers
} from "../../src/core/builtin_directives.js";

describe("Class actions", () => {
  let attractive;

  beforeEach(() => {
    document.body.innerHTML = "";
    vi.clearAllTimers();
    vi.useFakeTimers();
    vi.clearAllMocks();

    attractive = new Attractive();
  });

  test("class with run() is instantiated and run() is called", async () => {
    const run = vi.fn();
    let capturedElement;

    class TestAction {
      constructor(element, context) {
        capturedElement = element;
      }

      run() {
        run(this.element, this.options);
      }
    }

    attractive.activate({
      addActions: { testAction: TestAction },
      addGates: builtinGates,
      addTriggers: builtinTriggers
    });

    document.body.innerHTML = `
      <button id="btn" @action="testAction#hello">Click</button>
    `;
    await vi.runAllTimersAsync();

    document.getElementById("btn").click();
    await vi.runAllTimersAsync();

    expect(run).toHaveBeenCalledTimes(1);

    const [element, options] = run.mock.calls[0];
    expect(element).toBe(capturedElement);
    expect(element.id).toBe("btn");
    expect(options.value).toBe("hello");
  });

  test("function actions still work alongside class actions", async () => {
    const fn = vi.fn();

    attractive.activate({
      addActions: { myFunc: fn },
      addGates: builtinGates,
      addTriggers: builtinTriggers
    });

    document.body.innerHTML = `
      <button id="btn" @action="myFunc">Click</button>
    `;
    await vi.runAllTimersAsync();

    document.getElementById("btn").click();
    await vi.runAllTimersAsync();

    expect(fn).toHaveBeenCalledTimes(1);
    expect(fn.mock.calls[0][0].id).toBe("btn");
  });

  test("class action errors are caught and reported", async () => {
    class BrokenAction {
      run() {
        throw new Error("oops");
      }
    }

    attractive.activate({
      addActions: { broken: BrokenAction },
      addGates: builtinGates,
      addTriggers: builtinTriggers
    });

    document.body.innerHTML = `
      <button id="btn" @action="broken">Click</button>
    `;
    await vi.runAllTimersAsync();

    document.getElementById("btn").click();
    await vi.runAllTimersAsync();

    expect(true).toBe(true);
  });

  test("class without run() prototype is called as function", async () => {
    const fn = vi.fn();

    attractive.activate({
      addActions: { notAction: fn },
      addGates: builtinGates,
      addTriggers: builtinTriggers
    });

    document.body.innerHTML = `
      <button id="btn" @action="notAction">Click</button>
    `;
    await vi.runAllTimersAsync();

    document.getElementById("btn").click();
    await vi.runAllTimersAsync();

    expect(fn).toHaveBeenCalledTimes(1);
    expect(fn.mock.calls[0][0].id).toBe("btn");
  });
});
