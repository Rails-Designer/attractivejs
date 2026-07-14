import { describe, test, expect, beforeEach, vi } from "vitest";
import Attractive from "../../src/index.js";
import builtinActions from "../../src/actions/index.js";
import { builtinDirectives } from "../../src/core/builtin_directives.js";

const allBuiltinActions = builtinActions;

const defaultOptions = {
  addActions: allBuiltinActions,
  addDirectives: builtinDirectives
};

describe("Global Debounce", () => {
  let attractive;

  beforeEach(async () => {
    document.body.innerHTML = "";
    vi.clearAllTimers();
    vi.useFakeTimers();

    attractive = new Attractive();
  });

  test("fires action immediately without data-debounce", async () => {
    attractive.activate(defaultOptions);

    document.body.innerHTML = `
      <button id="trigger" @click="focus#target" @target="target">Focus</button>
      <input id="target">
    `;
    await vi.runAllTimersAsync();

    const target = document.getElementById("target");
    target.focus = vi.fn();

    document.getElementById("trigger").click();

    expect(target.focus).toHaveBeenCalled();
  });

  test("delays action with data-debounce", async () => {
    attractive.activate(defaultOptions);

    document.body.innerHTML = `
      <button id="trigger" @click="focus#target" @target="target" data-debounce="100">Focus</button>
      <input id="target">
    `;
    await vi.runAllTimersAsync();

    const target = document.getElementById("target");
    target.focus = vi.fn();

    document.getElementById("trigger").click();

    expect(target.focus).not.toHaveBeenCalled();

    vi.advanceTimersByTime(100);

    expect(target.focus).toHaveBeenCalled();
  });

  test("debounces multiple rapid calls to same element", async () => {
    attractive.activate(defaultOptions);

    document.body.innerHTML = `
      <button id="trigger" @click="focus#target" @target="target" data-debounce="100">Focus</button>
      <input id="target">
    `;
    await vi.runAllTimersAsync();

    const target = document.getElementById("target");
    target.focus = vi.fn();

    const btn = document.getElementById("trigger");

    btn.click();
    btn.click();
    btn.click();

    vi.advanceTimersByTime(100);

    expect(target.focus).toHaveBeenCalledTimes(1);
  });

  test("different elements have independent debounce timers", async () => {
    attractive.activate(defaultOptions);

    document.body.innerHTML = `
      <button id="a" @click="focus#target-a" @target="target-a" data-debounce="100">A</button>
      <button id="b" @click="focus#target-b" @target="target-b" data-debounce="100">B</button>
      <input id="target-a">
      <input id="target-b">
    `;
    await vi.runAllTimersAsync();

    const targetA = document.getElementById("target-a");
    const targetB = document.getElementById("target-b");
    targetA.focus = vi.fn();
    targetB.focus = vi.fn();

    document.getElementById("a").click();
    document.getElementById("b").click();

    expect(targetA.focus).not.toHaveBeenCalled();
    expect(targetB.focus).not.toHaveBeenCalled();

    vi.advanceTimersByTime(100);

    expect(targetA.focus).toHaveBeenCalledTimes(1);
    expect(targetB.focus).toHaveBeenCalledTimes(1);
  });

  test("supports legacy data-form-debounce attribute", async () => {
    attractive.activate(defaultOptions);

    document.body.innerHTML = `
      <button id="trigger" @click="focus#target" @target="target" data-form-debounce="100">Focus</button>
      <input id="target">
    `;
    await vi.runAllTimersAsync();

    const target = document.getElementById("target");
    target.focus = vi.fn();

    document.getElementById("trigger").click();

    expect(target.focus).not.toHaveBeenCalled();

    vi.advanceTimersByTime(100);

    expect(target.focus).toHaveBeenCalled();
  });

  test("supports legacy data-request-debounce attribute", async () => {
    attractive.activate(defaultOptions);

    document.body.innerHTML = `
      <button id="trigger" @click="focus#target" @target="target" data-request-debounce="100">Focus</button>
      <input id="target">
    `;
    await vi.runAllTimersAsync();

    const target = document.getElementById("target");
    target.focus = vi.fn();

    document.getElementById("trigger").click();

    expect(target.focus).not.toHaveBeenCalled();

    vi.advanceTimersByTime(100);

    expect(target.focus).toHaveBeenCalled();
  });

  test("data-debounce takes precedence over legacy attributes", async () => {
    attractive.activate(defaultOptions);

    document.body.innerHTML = `
      <button id="trigger" @click="focus#target" @target="target" data-debounce="50">Focus</button>
      <input id="target">
    `;
    await vi.runAllTimersAsync();

    const target = document.getElementById("target");
    target.focus = vi.fn();

    document.getElementById("trigger").click();

    expect(target.focus).not.toHaveBeenCalled();

    vi.advanceTimersByTime(50);

    expect(target.focus).toHaveBeenCalled();
  });
});
