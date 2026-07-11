import { describe, test, expect, beforeEach, vi } from "vitest";
import Attractive from "../../src/index.js";
import builtinActions from "../../src/actions/index.js";
import { defaultDirectives } from "../../src/core/builtin_directives.js";
import { keyboard } from "../../src/addons/keyboard/index.js";
import { hotkey } from "../../src/addons/keyboard/hotkey.js";

globalThis.Node = globalThis.Node || { ELEMENT_NODE: 1 };

let attractive;

describe("Keyboard addon", () => {
  beforeEach(() => {
    document.body.innerHTML = "";
    vi.clearAllTimers();
    vi.useFakeTimers();
    hotkey.clearSequenceState();

    attractive = new Attractive();

    attractive.registerActions((registry) => {
      Object.entries(builtinActions).forEach(([name, action]) =>
        registry.addAction(name, action)
      );
    });

    attractive.registerDirectives((directives) => {
      defaultDirectives(directives);
    });
  });

  test("@keydown.enter fires only on Enter key", async () => {
    attractive.extend(keyboard);
    attractive.activate();

    document.body.innerHTML = `
      <input id="input" @keydown.enter="addClass#enter" @target="target" />
      <span id="target">Target</span>
    `;

    await vi.runAllTimersAsync();

    const target = document.getElementById("target");
    const input = document.getElementById("input");

    input.dispatchEvent(
      new KeyboardEvent("keydown", { key: "Enter", bubbles: true })
    );

    expect(target.classList.contains("enter")).toBe(true);
  });

  test("@keydown.enter does not fire on other keys", async () => {
    attractive.extend(keyboard);
    attractive.activate();

    document.body.innerHTML = `
      <input id="input" @keydown.enter="addClass#enter" @target="target" />
      <span id="target">Target</span>
    `;

    await vi.runAllTimersAsync();

    const target = document.getElementById("target");
    const input = document.getElementById("input");

    input.dispatchEvent(
      new KeyboardEvent("keydown", { key: " ", bubbles: true })
    );

    expect(target.classList.contains("enter")).toBe(false);
  });

  test("@keydown.escape fires only on Escape key", async () => {
    attractive.extend(keyboard);
    attractive.activate();

    document.body.innerHTML = `
      <input id="input" @keydown.escape="addClass#escape" @target="target" />
      <span id="target">Target</span>
    `;

    await vi.runAllTimersAsync();

    const target = document.getElementById("target");
    const input = document.getElementById("input");

    input.dispatchEvent(
      new KeyboardEvent("keydown", { key: "Escape", bubbles: true })
    );

    expect(target.classList.contains("escape")).toBe(true);
  });

  test("@keydown.ctrl.k fires on Ctrl+K combo", async () => {
    attractive.extend(keyboard);
    attractive.activate();

    document.body.innerHTML = `
      <input id="input" @keydown.ctrl.k="addClass#combo" @target="target" />
      <span id="target">Target</span>
    `;

    await vi.runAllTimersAsync();

    const target = document.getElementById("target");
    const input = document.getElementById("input");

    input.dispatchEvent(
      new KeyboardEvent("keydown", { key: "k", ctrlKey: true, bubbles: true })
    );

    expect(target.classList.contains("combo")).toBe(true);
  });

  test("@keydown.ctrl.k does not fire on K without Ctrl", async () => {
    attractive.extend(keyboard);
    attractive.activate();

    document.body.innerHTML = `
      <input id="input" @keydown.ctrl.k="addClass#combo" @target="target" />
      <span id="target">Target</span>
    `;

    await vi.runAllTimersAsync();

    const target = document.getElementById("target");
    const input = document.getElementById("input");

    input.dispatchEvent(
      new KeyboardEvent("keydown", { key: "k", ctrlKey: false, bubbles: true })
    );

    expect(target.classList.contains("combo")).toBe(false);
  });

  test("@keydown without modifiers still fires on any key", async () => {
    attractive.extend(keyboard);
    attractive.activate();

    document.body.innerHTML = `
      <input id="input" @keydown="addClass#pressed" @target="target" />
      <span id="target">Target</span>
    `;

    await vi.runAllTimersAsync();

    const target = document.getElementById("target");
    const input = document.getElementById("input");

    input.dispatchEvent(
      new KeyboardEvent("keydown", { key: "a", bubbles: true })
    );

    expect(target.classList.contains("pressed")).toBe(true);
  });

  test("keyboard addon does not break @click.window", async () => {
    attractive.extend(keyboard);
    attractive.activate();

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

  test("keyboard addon does not break regular click events", async () => {
    attractive.extend(keyboard);
    attractive.activate();

    document.body.innerHTML = `
      <button id="btn" @click="addClass#clicked" @target="target">
        <span id="target">Target</span>
      </button>
    `;

    await vi.runAllTimersAsync();

    const target = document.getElementById("target");

    document.getElementById("btn").click();

    expect(target.classList.contains("clicked")).toBe(true);
  });

  test("@hotkey.escape with value executes action", async () => {
    attractive.extend(keyboard);
    attractive.activate();

    document.body.innerHTML = `
      <div @hotkey.escape="addClass#fired" @target="target"></div>
      <span id="target">Target</span>
    `;

    await vi.runAllTimersAsync();

    const target = document.getElementById("target");

    document.dispatchEvent(
      new KeyboardEvent("keydown", { key: "Escape", bubbles: true })
    );

    expect(target.classList.contains("fired")).toBe(true);
  });

  test("@hotkey.ctrl+k with value fires on combo", async () => {
    attractive.extend(keyboard);
    attractive.activate();

    document.body.innerHTML = `
      <div @hotkey.ctrl+k="addClass#fired" @target="target"></div>
      <span id="target">Target</span>
    `;

    await vi.runAllTimersAsync();

    const target = document.getElementById("target");

    document.dispatchEvent(
      new KeyboardEvent("keydown", { key: "k", ctrlKey: true, bubbles: true })
    );

    expect(target.classList.contains("fired")).toBe(true);
  });

  test("@hotkey.ctrl+k does not fire on K without Ctrl", async () => {
    attractive.extend(keyboard);
    attractive.activate();

    document.body.innerHTML = `
      <div @hotkey.ctrl+k="addClass#fired" @target="target"></div>
      <span id="target">Target</span>
    `;

    await vi.runAllTimersAsync();

    const target = document.getElementById("target");

    document.dispatchEvent(
      new KeyboardEvent("keydown", { key: "k", ctrlKey: false, bubbles: true })
    );

    expect(target.classList.contains("fired")).toBe(false);
  });

  test("@hotkey.g.i sequence fires after g then i", async () => {
    attractive.extend(keyboard);
    attractive.activate();

    document.body.innerHTML = `
      <div @hotkey.g.i="addClass#fired" @target="target"></div>
      <span id="target">Target</span>
    `;

    await vi.runAllTimersAsync();

    const target = document.getElementById("target");

    document.dispatchEvent(
      new KeyboardEvent("keydown", { key: "g", bubbles: true })
    );

    expect(target.classList.contains("fired")).toBe(false);

    document.dispatchEvent(
      new KeyboardEvent("keyup", { key: "g", bubbles: true })
    );

    document.dispatchEvent(
      new KeyboardEvent("keydown", { key: "i", bubbles: true })
    );

    await vi.runAllTimersAsync();

    expect(target.classList.contains("fired")).toBe(true);
  });

  test("bare @hotkey.escape triggers click on element", async () => {
    attractive.extend(keyboard);
    attractive.activate();

    document.body.innerHTML = `
      <button @hotkey.escape id="btn">Close</button>
    `;

    await vi.runAllTimersAsync();

    const btn = document.getElementById("btn");
    const clicked = vi.fn();

    btn.addEventListener("click", clicked);

    document.dispatchEvent(
      new KeyboardEvent("keydown", { key: "Escape", bubbles: true })
    );

    expect(clicked).toHaveBeenCalled();
  });

  test("@hotkey.g+i fires when both keys are held", async () => {
    attractive.extend(keyboard);
    attractive.activate();

    document.body.innerHTML = `
      <div @hotkey.g+i="addClass#fired" @target="target"></div>
      <span id="target">Target</span>
    `;

    await vi.runAllTimersAsync();

    const target = document.getElementById("target");

    document.dispatchEvent(
      new KeyboardEvent("keydown", { key: "g", bubbles: true })
    );

    expect(target.classList.contains("fired")).toBe(false);

    document.dispatchEvent(
      new KeyboardEvent("keydown", { key: "i", bubbles: true })
    );

    await vi.runAllTimersAsync();

    expect(target.classList.contains("fired")).toBe(true);
  });

  test("@hotkey.g+i combo clears held keys after firing", async () => {
    attractive.extend(keyboard);
    attractive.activate();

    document.body.innerHTML = `
      <div @hotkey.g+i="addClass#fired" @target="target"></div>
      <span id="target">Target</span>
    `;

    await vi.runAllTimersAsync();

    const target = document.getElementById("target");

    document.dispatchEvent(
      new KeyboardEvent("keydown", { key: "g", bubbles: true })
    );

    document.dispatchEvent(
      new KeyboardEvent("keydown", { key: "i", bubbles: true })
    );

    await vi.runAllTimersAsync();

    expect(target.classList.contains("fired")).toBe(true);

    target.classList.remove("fired");

    document.dispatchEvent(
      new KeyboardEvent("keydown", { key: "g", bubbles: true })
    );

    await vi.runAllTimersAsync();

    expect(target.classList.contains("fired")).toBe(false);
  });

  test("@hotkey.g+i combo does not fire after keyup", async () => {
    attractive.extend(keyboard);
    attractive.activate();

    document.body.innerHTML = `
      <div @hotkey.g+i="addClass#fired" @target="target"></div>
      <span id="target">Target</span>
    `;

    await vi.runAllTimersAsync();

    const target = document.getElementById("target");

    document.dispatchEvent(
      new KeyboardEvent("keydown", { key: "g", bubbles: true })
    );

    document.dispatchEvent(
      new KeyboardEvent("keydown", { key: "i", bubbles: true })
    );

    await vi.runAllTimersAsync();

    expect(target.classList.contains("fired")).toBe(true);

    target.classList.remove("fired");

    document.dispatchEvent(
      new KeyboardEvent("keyup", { key: "g", bubbles: true })
    );

    document.dispatchEvent(
      new KeyboardEvent("keydown", { key: "g", bubbles: true })
    );

    await vi.runAllTimersAsync();

    expect(target.classList.contains("fired")).toBe(false);
  });

  test("@hotkey.g+i combo fires alongside same-key sequence", async () => {
    attractive.extend(keyboard);
    attractive.activate();

    document.body.innerHTML = `
      <div @hotkey.g.i="addClass#seq" @target="seqTarget"></div>
      <div @hotkey.g+i="addClass#combo" @target="comboTarget"></div>
      <span id="seqTarget">Seq</span>
      <span id="comboTarget">Combo</span>
    `;

    await vi.runAllTimersAsync();

    const seqTarget = document.getElementById("seqTarget");
    const comboTarget = document.getElementById("comboTarget");

    document.dispatchEvent(
      new KeyboardEvent("keydown", { key: "g", bubbles: true })
    );

    document.dispatchEvent(
      new KeyboardEvent("keydown", { key: "i", bubbles: true })
    );

    await vi.runAllTimersAsync();

    expect(seqTarget.classList.contains("seq")).toBe(false);
    expect(comboTarget.classList.contains("combo")).toBe(true);
  });
});
