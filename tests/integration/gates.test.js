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

test("once gate allows action only on first click", async () => {
  attractive.activate({
    addActions: allBuiltinActions,
    addDirectives: builtinDirectives
  });

  document.body.innerHTML = `
    <button id="btn" @action="addClass#toggled:once" @target="target">
      <span id="target">Target</span>
    </button>
  `;

  await vi.runAllTimersAsync();

  const target = document.getElementById("target");

  const button = document.getElementById("btn");
  button.click();
  expect(target.classList.contains("toggled")).toBe(true);

  button.click();
  const classListAfterSecond = target.classList.contains("toggled");
  expect(classListAfterSecond).toBe(true);
});

test("whenOutside gate blocks action when clicking inside element", async () => {
  attractive.activate({
    addActions: allBuiltinActions,
    addDirectives: builtinDirectives
  });

  document.body.innerHTML = `
    <div id="outer" @click.window="addClass#clicked:whenOutside" @target="target">
      <div id="inner">Inside</div>
    </div>
    <span id="target">Target</span>
  `;

  await vi.runAllTimersAsync();

  const target = document.getElementById("target");

  document.getElementById("inner").click();
  expect(target.classList.contains("clicked")).toBe(false);
});

test("whenOutside gate allows action when clicking outside element", async () => {
  attractive.activate({
    addActions: allBuiltinActions,
    addDirectives: builtinDirectives
  });

  document.body.innerHTML = `
    <div id="outer" @click.window="addClass#clicked:whenOutside" @target="target">
      <div id="inner">Inside</div>
    </div>
    <div id="outside">Outside</div>
    <span id="target">Target</span>
  `;

  await vi.runAllTimersAsync();

  const target = document.getElementById("target");

  document.getElementById("outside").click();
  expect(target.classList.contains("clicked")).toBe(true);
});

test("preventDefault gate stops default browser behavior", async () => {
  attractive.activate({
    addActions: allBuiltinActions,
    addDirectives: builtinDirectives
  });

  document.body.innerHTML = `
    <a href="https://example.com" @action="addClass#clicked:preventDefault" @target="target">Click me</a>
    <span id="target">Target</span>
  `;

  await vi.runAllTimersAsync();

  const target = document.getElementById("target");
  const link = document.querySelector("a");

  link.click();

  expect(target.classList.contains("clicked")).toBe(true);
});
