import { test, expect, beforeEach, vi } from "vitest";
import Attractive from "../../src/index.js";
import builtinActions from "../../src/actions/index.js";
import { builtinDirectives } from "../../src/core/builtin_directives.js";
import { js } from "../../src/actions/inline.js";

globalThis.Node = globalThis.Node || { ELEMENT_NODE: 1 };

const allBuiltinActions = builtinActions;

let attractive;

beforeEach(() => {
  document.body.innerHTML = "";
  vi.clearAllTimers();
  vi.useFakeTimers();

  attractive = new Attractive();
});

test("evaluates expression on click", async () => {
  attractive.activate({
    addActions: { ...allBuiltinActions, js },
    addDirectives: builtinDirectives
  });

  document.body.innerHTML = `
    <button id="btn" @click="js:this.textContent = 'done'">Click</button>
  `;

  await vi.runAllTimersAsync();

  document.getElementById("btn").click();
  await vi.runAllTimersAsync();

  expect(document.getElementById("btn").textContent).toBe("done");
});

test("this refers to the element in expression", async () => {
  attractive.activate({
    addActions: { ...allBuiltinActions, js },
    addDirectives: builtinDirectives
  });

  document.body.innerHTML = `
    <button id="btn" @click="js:this.dataset.tagName = this.tagName">Click</button>
  `;

  await vi.runAllTimersAsync();

  document.getElementById("btn").click();
  await vi.runAllTimersAsync();

  expect(document.getElementById("btn").dataset.tagName).toBe("BUTTON");
});

test("event is passed to expression", async () => {
  attractive.activate({
    addActions: { ...allBuiltinActions, js },
    addDirectives: builtinDirectives
  });

  document.body.innerHTML = `
    <button id="btn" @click="js:this.dataset.eventType = event.type">Click</button>
  `;

  await vi.runAllTimersAsync();

  document.getElementById("btn").click();
  await vi.runAllTimersAsync();

  expect(document.getElementById("btn").dataset.eventType).toBe("click");
});

test("returning false prevents default behavior", async () => {
  const preventDefault = vi.spyOn(Event.prototype, "preventDefault");

  attractive.activate({
    addActions: { ...allBuiltinActions, js },
    addDirectives: builtinDirectives
  });

  document.body.innerHTML = `
    <a id="link" href="/" @click="js:false">Link</a>
  `;

  await vi.runAllTimersAsync();

  document.getElementById("link").click();
  await vi.runAllTimersAsync();

  expect(preventDefault).toHaveBeenCalled();
});

test("works with event modifier on window", async () => {
  attractive.activate({
    addActions: { ...allBuiltinActions, js },
    addDirectives: builtinDirectives
  });

  document.body.innerHTML = `
    <button id="btn" @click.window="js:this.dataset.clicked = 'yes'">Click</button>
  `;

  await vi.runAllTimersAsync();

  window.dispatchEvent(new MouseEvent("click"));
  await vi.runAllTimersAsync();

  expect(document.getElementById("btn").dataset.clicked).toBe("yes");
});

test("works with key modifier", async () => {
  attractive.activate({
    addActions: { ...allBuiltinActions, js },
    addDirectives: builtinDirectives
  });

  document.body.innerHTML = `
    <input id="input" @keydown.enter="js:this.dataset.triggered = 'yes'" />
  `;

  await vi.runAllTimersAsync();

  document
    .getElementById("input")
    .dispatchEvent(
      new KeyboardEvent("keydown", { key: "Enter", bubbles: true })
    );
  await vi.runAllTimersAsync();

  expect(document.getElementById("input").dataset.triggered).toBe("yes");
});

test("@action on input uses default event", async () => {
  attractive.activate({
    addActions: { ...allBuiltinActions, js },
    addDirectives: builtinDirectives
  });

  document.body.innerHTML = `
    <input id="input" @action="js:this.dataset.triggered = 'yes'" />
  `;

  await vi.runAllTimersAsync();

  const input = document.getElementById("input");
  input.dispatchEvent(new Event("input", { bubbles: true }));
  await vi.runAllTimersAsync();

  expect(input.dataset.triggered).toBe("yes");
});

test("data-debounce delays execution", async () => {
  attractive.activate({
    addActions: { ...allBuiltinActions, js },
    addDirectives: builtinDirectives
  });

  document.body.innerHTML = `
    <input id="input" @action="js:this.dataset.triggered = 'yes'" data-debounce="200" />
  `;

  await Promise.resolve();

  const input = document.getElementById("input");
  input.dispatchEvent(new Event("input", { bubbles: true }));

  expect(input.dataset.triggered).toBeUndefined();
  expect(vi.getTimerCount()).toBeGreaterThan(0);

  vi.advanceTimersByTime(200);
  await vi.runAllTimersAsync();

  expect(input.dataset.triggered).toBe("yes");
});

test("can be combined with other actions via separate attributes", async () => {
  attractive.activate({
    addActions: { ...allBuiltinActions, js },
    addDirectives: builtinDirectives
  });

  document.body.innerHTML = `
    <button id="btn" @click="js:this.dataset.jsRan = 'true'" @mouseenter="addClass#hovered">Hover</button>
  `;

  await vi.runAllTimersAsync();

  document.getElementById("btn").click();
  await vi.runAllTimersAsync();

  expect(document.getElementById("btn").dataset.jsRan).toBe("true");
});

test("before and after hooks fire for js action", async () => {
  const before = vi.fn();
  const after = vi.fn();

  attractive.beforeAction(before);
  attractive.afterAction(after);

  attractive.activate({
    addActions: { ...allBuiltinActions, js },
    addDirectives: builtinDirectives
  });

  document.body.innerHTML = `
    <button id="btn" @click="js:this.textContent = 'done'">Click</button>
  `;

  await vi.runAllTimersAsync();

  document.getElementById("btn").click();
  await vi.runAllTimersAsync();

  expect(before).toHaveBeenCalledWith(expect.objectContaining({ name: "js" }));

  expect(after).toHaveBeenCalledWith(
    expect.objectContaining({ name: "js", result: "done" })
  );
});

test("errors are caught and routed to onError", async () => {
  const hook = vi.fn();

  attractive.onError(hook);

  attractive.activate({
    addActions: { ...allBuiltinActions, js },
    addDirectives: builtinDirectives
  });

  document.body.innerHTML = `
    <button id="btn" @click="js:invalid.code(">Click</button>
  `;

  await vi.runAllTimersAsync();
  document.getElementById("btn").click();
  await vi.runAllTimersAsync();

  expect(hook).toHaveBeenCalledWith(
    expect.objectContaining({
      name: "js",
      error: expect.any(Error)
    })
  );
});
