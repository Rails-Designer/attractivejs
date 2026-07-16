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

test("chained gates both evaluate correctly", async () => {
  let callCount = 0;

  attractive.activate({
    addActions: {
      ...allBuiltinActions,
      chainedTest: () => {
        callCount++;
      }
    },
    addGates: builtinGates,
    addTriggers: builtinTriggers
  });

  document.body.innerHTML = `
    <button id="btn" @action="chainedTest:preventDefault">Click</button>
  `;

  await vi.runAllTimersAsync();

  document.getElementById("btn").click();

  await vi.runAllTimersAsync();

  expect(callCount).toBe(1);
});

test("chained with trigger and gate still works", async () => {
  attractive.activate({
    addActions: allBuiltinActions,
    addGates: builtinGates,
    addTriggers: builtinTriggers
  });

  document.body.innerHTML = `
    <button id="btn" @action="addClass#loaded:mounted:once" @target="target">Click</button>
    <span id="target">Target</span>
  `;

  await vi.runAllTimersAsync();

  const target = document.getElementById("target");
  expect(target.classList.contains("loaded")).toBe(true);
});
