import { test, expect, beforeEach, vi } from "vitest";
import Attractive from "../../src/index.js";
import builtinActions from "../../src/actions/index.js";
import {
  builtinGates,
  builtinTriggers
} from "../../src/core/builtin_directives.js";

globalThis.Node = globalThis.Node || { ELEMENT_NODE: 1 };

const allBuiltinActions = builtinActions;

let attractive;

beforeEach(() => {
  document.body.innerHTML = "";
  vi.clearAllTimers();
  vi.useFakeTimers();

  attractive = new Attractive();
});

test("error from action does not bubble up as unhandled", async () => {
  attractive.activate({
    addActions: {
      ...allBuiltinActions,
      thrower: () => {
        throw new Error("boom");
      }
    },
    addGates: builtinGates,
    addTriggers: builtinTriggers
  });

  document.body.innerHTML = `
    <button id="btn" @action="thrower">Click</button>
  `;

  await vi.runAllTimersAsync();

  expect(() => {
    document.getElementById("btn").click();
  }).not.toThrow();
});

test("instance onError hook runs when action throws", async () => {
  const hook = vi.fn();
  const error = new Error("boom");

  attractive.onError(hook);

  attractive.activate({
    addActions: {
      ...allBuiltinActions,
      thrower: () => {
        throw error;
      }
    },
    addGates: builtinGates,
    addTriggers: builtinTriggers
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

test("Attractive.onError global fallback receives error context", async () => {
  const fallback = vi.fn();
  const original = Attractive.onError;

  Attractive.onError = fallback;

  attractive.activate({
    addActions: {
      ...allBuiltinActions,
      thrower: () => {
        throw new Error("boom");
      }
    },
    addGates: builtinGates,
    addTriggers: builtinTriggers
  });

  document.body.innerHTML = `
    <button id="btn" @action="thrower">Click</button>
  `;

  await vi.runAllTimersAsync();
  document.getElementById("btn").click();
  await vi.runAllTimersAsync();

  expect(fallback).toHaveBeenCalledWith(
    expect.any(Error),
    expect.stringContaining("thrower"),
    expect.objectContaining({ actionName: "thrower" })
  );

  Attractive.onError = original;
});
