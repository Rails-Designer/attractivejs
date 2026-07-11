import { describe, test, expect, beforeEach, vi } from "vitest";
import focusActions from "../../src/actions/focus.js";

describe("ActionBase - Global Debounce", () => {
  beforeEach(() => {
    document.body.innerHTML = "";
    vi.clearAllTimers();
    vi.useFakeTimers();
  });

  test("fires action immediately without data-debounce", () => {
    document.body.innerHTML = `
      <button id="trigger">Focus</button>
      <input id="target">
    `;
    const element = document.getElementById("trigger");
    const target = document.getElementById("target");
    target.focus = vi.fn();

    focusActions.focus(element, { target: "target" });

    expect(target.focus).toHaveBeenCalled();
  });

  test("delays action with data-debounce", () => {
    document.body.innerHTML = `
      <button id="trigger" data-debounce="100">Focus</button>
      <input id="target">
    `;
    const element = document.getElementById("trigger");
    const target = document.getElementById("target");
    target.focus = vi.fn();

    focusActions.focus(element, { target: "target" });

    expect(target.focus).not.toHaveBeenCalled();

    vi.advanceTimersByTime(100);

    expect(target.focus).toHaveBeenCalled();
  });

  test("debounces multiple rapid calls to same element", () => {
    document.body.innerHTML = `
      <button id="trigger" data-debounce="100">Focus</button>
      <input id="target">
    `;
    const element = document.getElementById("trigger");
    const target = document.getElementById("target");
    target.focus = vi.fn();

    focusActions.focus(element, { target: "target" });
    focusActions.focus(element, { target: "target" });
    focusActions.focus(element, { target: "target" });

    vi.advanceTimersByTime(100);

    expect(target.focus).toHaveBeenCalledTimes(1);
  });

  test("different elements have independent debounce timers", () => {
    document.body.innerHTML = `
      <button id="a" data-debounce="100">A</button>
      <button id="b" data-debounce="100">B</button>
      <input id="target-a">
      <input id="target-b">
    `;
    const elementA = document.getElementById("a");
    const elementB = document.getElementById("b");
    const targetA = document.getElementById("target-a");
    const targetB = document.getElementById("target-b");
    targetA.focus = vi.fn();
    targetB.focus = vi.fn();

    focusActions.focus(elementA, { target: "target-a" });
    focusActions.focus(elementB, { target: "target-b" });

    expect(targetA.focus).not.toHaveBeenCalled();
    expect(targetB.focus).not.toHaveBeenCalled();

    vi.advanceTimersByTime(100);

    expect(targetA.focus).toHaveBeenCalledTimes(1);
    expect(targetB.focus).toHaveBeenCalledTimes(1);
  });

  test("supports legacy data-form-debounce attribute", () => {
    document.body.innerHTML = `
      <button id="trigger" data-form-debounce="100">Focus</button>
      <input id="target">
    `;
    const element = document.getElementById("trigger");
    const target = document.getElementById("target");
    target.focus = vi.fn();

    focusActions.focus(element, { target: "target" });

    expect(target.focus).not.toHaveBeenCalled();

    vi.advanceTimersByTime(100);

    expect(target.focus).toHaveBeenCalled();
  });

  test("supports legacy data-request-debounce attribute", () => {
    document.body.innerHTML = `
      <button id="trigger" data-request-debounce="100">Focus</button>
      <input id="target">
    `;
    const element = document.getElementById("trigger");
    const target = document.getElementById("target");
    target.focus = vi.fn();

    focusActions.focus(element, { target: "target" });

    expect(target.focus).not.toHaveBeenCalled();

    vi.advanceTimersByTime(100);

    expect(target.focus).toHaveBeenCalled();
  });

  test("data-debounce takes precedence over legacy attributes", () => {
    document.body.innerHTML = `
      <button id="trigger" data-debounce="50" data-form-debounce="200">Focus</button>
      <input id="target">
    `;
    const element = document.getElementById("trigger");
    const target = document.getElementById("target");
    target.focus = vi.fn();

    focusActions.focus(element, { target: "target" });

    expect(target.focus).not.toHaveBeenCalled();

    vi.advanceTimersByTime(50);

    expect(target.focus).toHaveBeenCalled();
  });
});
