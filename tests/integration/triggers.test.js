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

test("mounted trigger runs addClass immediately when element is added to DOM", async () => {
  attractive.activate({
    addActions: allBuiltinActions,
    addGates: builtinGates,
    addTriggers: builtinTriggers
  });

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
  attractive.activate({
    addActions: allBuiltinActions,
    addGates: builtinGates,
    addTriggers: builtinTriggers
  });

  document.body.innerHTML = `
    <button id="trigger" @mouseenter="addClass#hovered">Hover me</button>
  `;

  await vi.runAllTimersAsync();

  const trigger = document.getElementById("trigger");
  trigger.dispatchEvent(new MouseEvent("mouseenter", { bubbles: true }));

  expect(trigger.classList.contains("hovered")).toBe(true);
});

test("whenVisible trigger runs when element becomes visible", async () => {
  const mockObserve = vi.fn();
  const mockDisconnect = vi.fn();

  global.IntersectionObserver = vi.fn().mockImplementation((_) => ({
    observe: mockObserve,
    disconnect: mockDisconnect
  }));

  attractive.activate({
    addActions: allBuiltinActions,
    addGates: builtinGates,
    addTriggers: builtinTriggers
  });

  document.body.innerHTML = `
    <div @action="addClass#visible:whenVisible" @target="target">
      <span id="target">Target</span>
    </div>
  `;

  await vi.runAllTimersAsync();

  expect(mockObserve).toHaveBeenCalled();
});

test("whenInView trigger runs when element becomes visible", async () => {
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
  attractive.activate({
    addActions: allBuiltinActions,
    addGates: builtinGates,
    addTriggers: builtinTriggers
  });

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
