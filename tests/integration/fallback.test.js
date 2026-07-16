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

test("fallback action syntax with hash", async () => {
  attractive.activate({
    addActions: allBuiltinActions,
    addGates: builtinGates,
    addTriggers: builtinTriggers
  });

  document.body.innerHTML = `
    <button @action="nonExistentAction#addClass#fallback:mounted" @target="target">
      <div id="target">Target</div>
    </button>
  `;

  await vi.runAllTimersAsync();

  const target = document.getElementById("target");
  expect(target.classList.contains("fallback")).toBe(true);
});

test("unregistered action name does not throw", async () => {
  attractive.activate({
    addActions: allBuiltinActions,
    addGates: builtinGates,
    addTriggers: builtinTriggers
  });

  document.body.innerHTML = `
    <button @action="nonExistentAction">Click me</button>
  `;

  await vi.runAllTimersAsync();

  expect(() => {
    document.querySelector("button").click();
  }).not.toThrow();
});
