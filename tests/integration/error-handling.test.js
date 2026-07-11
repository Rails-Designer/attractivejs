import { test, expect, beforeEach, vi } from "vitest";
import Attractive from "../../src/index.js";
import builtinActions from "../../src/actions/index.js";
import { defaultDirectives } from "../../src/core/builtin_directives.js";

globalThis.Node = globalThis.Node || { ELEMENT_NODE: 1 };

let attractive;

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
