import { test, expect, beforeEach, vi } from "vitest";
import Attractive from "../../src/index.js";
import builtinActions from "../../src/actions/index.js";
import { builtinDirectives } from "../../src/core/builtin_directives.js";

const allBuiltinActions = builtinActions;

let attractive;

beforeEach(() => {
  if (attractive) attractive.deactivate();

  document.body.innerHTML = "";
  vi.clearAllTimers();
  vi.useFakeTimers();

  attractive = new Attractive();
});

test("deactivate removes event listeners", async () => {
  attractive.activate({
    addActions: allBuiltinActions,
    addDirectives: builtinDirectives
  });

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
  attractive.activate({
    addActions: allBuiltinActions,
    addDirectives: builtinDirectives
  });

  document.body.innerHTML = `
    <button @action="addClass#toggled" @target="target">
      <span id="target">Target</span>
    </button>
  `;

  await vi.runAllTimersAsync();

  attractive.deactivate();

  document.body.innerHTML = "";
  vi.clearAllTimers();

  attractive.activate({
    addActions: allBuiltinActions,
    addDirectives: builtinDirectives
  });

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
  attractive.activate({
    addActions: allBuiltinActions,
    addDirectives: builtinDirectives
  });

  document.body.innerHTML = `
    <button @action="addClass#toggled" @target="target">
      <span id="target">Target</span>
    </button>
  `;

  await vi.runAllTimersAsync();

  attractive.restart({
    addActions: allBuiltinActions,
    addDirectives: builtinDirectives,
    debug: true
  });

  document.querySelector("button").click();

  const target = document.getElementById("target");

  expect(target.classList.contains("toggled")).toBe(true);
});

test("active returns false before activation", () => {
  expect(attractive.active).toBe(false);
});

test("active returns true after activation", () => {
  attractive.activate({
    addActions: allBuiltinActions,
    addDirectives: builtinDirectives
  });

  expect(attractive.active).toBe(true);
});

test("active returns false after deactivation", () => {
  attractive.activate({
    addActions: allBuiltinActions,
    addDirectives: builtinDirectives
  });
  attractive.deactivate();

  expect(attractive.active).toBe(false);
});

test("active returns true after reactivation", () => {
  attractive.activate({
    addActions: allBuiltinActions,
    addDirectives: builtinDirectives
  });
  attractive.deactivate();
  attractive.activate({
    addActions: allBuiltinActions,
    addDirectives: builtinDirectives
  });

  expect(attractive.active).toBe(true);
});

test("active returns true after restart", () => {
  attractive.activate({
    addActions: allBuiltinActions,
    addDirectives: builtinDirectives
  });
  attractive.restart({
    addActions: allBuiltinActions,
    addDirectives: builtinDirectives
  });

  expect(attractive.active).toBe(true);
});

test("removing @action attribute cleans up action", async () => {
  attractive.activate({
    addActions: allBuiltinActions,
    addDirectives: builtinDirectives
  });

  document.body.innerHTML = `<button id="btn" @action="toggleClass#toggled" @target="target"><span id="target">Target</span></button>`;
  await vi.runAllTimersAsync();

  const btn = document.getElementById("btn");
  const target = document.getElementById("target");

  btn.click();
  expect(target.classList.contains("toggled")).toBe(true);

  btn.removeAttribute("@action");
  await vi.runAllTimersAsync();

  btn.click();
  expect(target.classList.contains("toggled")).toBe(true);
});
