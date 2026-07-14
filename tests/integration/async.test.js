import { test, expect, beforeEach, vi } from "vitest";
import Attractive from "../../src/index.js";
import builtinActions from "../../src/actions/index.js";
import { builtinDirectives } from "../../src/core/builtin_directives.js";

globalThis.Node = globalThis.Node || { ELEMENT_NODE: 1 };

const allBuiltinActions = builtinActions;

let attractive;

beforeEach(() => {
  document.body.innerHTML = "";
  vi.clearAllTimers();
  vi.useFakeTimers();

  attractive = new Attractive();
});

test("async action resolves correctly", async () => {
  attractive.activate({
    addActions: {
      ...allBuiltinActions,
      asyncAction: async (element) => {
        const result = await Promise.resolve("done");

        element.dataset.asyncResult = result;
      }
    },
    addDirectives: builtinDirectives
  });

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

  attractive.activate({
    addActions: {
      ...allBuiltinActions,
      asyncPrevent: async () => {
        actionCalled = true;

        return false;
      }
    },
    addDirectives: builtinDirectives
  });

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

  attractive.activate({
    addActions: {
      ...allBuiltinActions,
      first: async () => {
        order.push("first");

        return false;
      },
      second: () => {
        order.push("second");
      }
    },
    addDirectives: builtinDirectives
  });

  document.body.innerHTML = `
    <button id="btn" @action="first second">Multi</button>
  `;

  await vi.runAllTimersAsync();

  document.getElementById("btn").click();

  await vi.runAllTimersAsync();

  expect(order).toEqual(["first"]);
});
