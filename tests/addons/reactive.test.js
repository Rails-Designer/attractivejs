import { describe, test, expect, beforeEach, vi } from "vitest";

import Attractive from "../../src/index.js";
import builtinActions from "../../src/actions/index.js";
import { builtinDirectives } from "../../src/core/builtin_directives.js";
import { reactive } from "../../src/addons/reactive/index.js";
import { store, subscribe } from "../../src/addons/reactive/store.js";

const allBuiltinActions = builtinActions;

let attractive;

describe("Reactive addon", () => {
  beforeEach(() => {
    if (attractive) attractive.deactivate();
    document.body.innerHTML = "";
    vi.clearAllTimers();
    vi.useFakeTimers();

    attractive = new Attractive();
  });

  describe("Store", () => {
    test("set and get a value", () => {
      store.set("name", { with: "Alice" });
      expect(store.get("name")).toBe("Alice");
    });

    test("get returns undefined for unset key", () => {
      expect(store.get("nonexistent")).toBeUndefined();
    });

    test("clear removes all keys", () => {
      store.set("a", { with: 1 });
      store.set("b", { with: 2 });
      store.clear();

      expect(store.get("a")).toBeUndefined();
      expect(store.get("b")).toBeUndefined();
    });

    test("clear notifies subscribers with undefined", () => {
      const fnA = vi.fn();
      const fnB = vi.fn();
      subscribe("x", { with: fnA });
      subscribe("y", { with: fnB });

      store.set("x", { with: "hello" });
      store.set("y", { with: "world" });

      store.clear();

      expect(fnA).toHaveBeenCalledWith(undefined);
      expect(fnB).toHaveBeenCalledWith(undefined);
    });

    test("clear does not remove subscriptions", () => {
      const fn = vi.fn();
      subscribe("z", { with: fn });

      store.clear();
      store.set("z", { with: "after" });

      expect(fn).toHaveBeenCalledWith("after");
    });

    test("subscriber is notified exactly once per clear", () => {
      const fn = vi.fn();
      subscribe("k", { with: fn });

      store.set("k", { with: "value" });
      fn.mockClear();

      store.clear();

      expect(fn).toHaveBeenCalledTimes(1);
      expect(fn).toHaveBeenCalledWith(undefined);
    });

    test("clear with no subscriptions does not throw", () => {
      expect(() => store.clear()).not.toThrow();
    });
  });

  describe("@text binding", () => {
    test("sets initial textContent from store", async () => {
      store.set("text-greeting", { with: "Hello" });

      attractive.activate({
        addActions: allBuiltinActions,
        addDirectives: builtinDirectives,
        extendWith: [reactive]
      });

      document.body.innerHTML = `<p @text="text-greeting"></p>`;
      await vi.runAllTimersAsync();

      const p = document.querySelector("p");
      expect(p.textContent).toBe("Hello");
    });

    test("updates textContent on store change", async () => {
      attractive.activate({
        addActions: allBuiltinActions,
        addDirectives: builtinDirectives,
        extendWith: [reactive]
      });

      document.body.innerHTML = `<p id="p" @text="text-update"></p>`;
      await vi.runAllTimersAsync();

      store.set("text-update", { with: "Hello, Alice!" });

      expect(document.getElementById("p").textContent).toBe("Hello, Alice!");
    });

    test("shows empty string for unset key", () => {
      attractive.activate({
        addActions: allBuiltinActions,
        addDirectives: builtinDirectives,
        extendWith: [reactive]
      });

      document.body.innerHTML = `<p @text="text-unset"></p>`;

      const p = document.querySelector("p");
      expect(p.textContent).toBe("");
    });

    test("preserves element content when store has no value for the key", async () => {
      attractive.activate({
        addActions: allBuiltinActions,
        addDirectives: builtinDirectives,
        extendWith: [reactive]
      });

      document.body.innerHTML = `<span @text="text-preserve">Betty</span>`;
      await vi.runAllTimersAsync();

      const span = document.querySelector("span");
      expect(span.textContent).toBe("Betty");
    });

    test("element content seeds the store when no value is set", async () => {
      attractive.activate({
        addActions: allBuiltinActions,
        addDirectives: builtinDirectives,
        extendWith: [reactive]
      });

      document.body.innerHTML = `<span @text="text-seed">Betty</span>`;
      await vi.runAllTimersAsync();

      expect(store.get("text-seed")).toBe("Betty");
    });

    test("seeded value updates when store is set", async () => {
      attractive.activate({
        addActions: allBuiltinActions,
        addDirectives: builtinDirectives,
        extendWith: [reactive]
      });

      document.body.innerHTML = `<span id="s" @text="text-seeded">Betty</span>`;
      await vi.runAllTimersAsync();

      store.set("text-seeded", { with: "Alice" });

      expect(document.getElementById("s").textContent).toBe("Alice");
    });

    test("shows empty string for null value", () => {
      store.set("text-null", { with: null });

      attractive.activate({
        addActions: allBuiltinActions,
        addDirectives: builtinDirectives,
        extendWith: [reactive]
      });

      document.body.innerHTML = `<p @text="text-null"></p>`;

      const p = document.querySelector("p");
      expect(p.textContent).toBe("");
    });

    test("shows empty string for undefined value", () => {
      store.set("text-undefined", { with: undefined });

      attractive.activate({
        addActions: allBuiltinActions,
        addDirectives: builtinDirectives,
        extendWith: [reactive]
      });

      document.body.innerHTML = `<p @text="text-undefined"></p>`;

      const p = document.querySelector("p");
      expect(p.textContent).toBe("");
    });

    test("multiple elements bound to same key all update", async () => {
      attractive.activate({
        addActions: allBuiltinActions,
        addDirectives: builtinDirectives,
        extendWith: [reactive]
      });

      document.body.innerHTML = `
        <p id="a" @text="text-multi"></p>
        <p id="b" @text="text-multi"></p>
      `;
      await vi.runAllTimersAsync();

      store.set("text-multi", { with: "Bob" });

      expect(document.getElementById("a").textContent).toBe("Bob");
      expect(document.getElementById("b").textContent).toBe("Bob");
    });

    test("removing @text attribute unbinds listener", async () => {
      store.set("text-removal", { with: "hello" });

      attractive.activate({
        addActions: allBuiltinActions,
        addDirectives: builtinDirectives,
        extendWith: [reactive]
      });

      document.body.innerHTML = `<p id="p" @text="text-removal"></p>`;
      await Promise.resolve();

      const p = document.getElementById("p");
      expect(p.textContent).toBe("hello");

      p.removeAttribute("@text");
      await Promise.resolve();

      store.set("text-removal", { with: "world" });

      expect(p.textContent).toBe("hello");
    });

    test("works inside template clone", async () => {
      attractive.activate({
        addActions: allBuiltinActions,
        addDirectives: builtinDirectives,
        extendWith: [reactive]
      });

      const template = document.createElement("template");
      template.innerHTML = `<p @text="text-template"></p>`;

      const clone = template.content.cloneNode(true);
      document.body.appendChild(clone);
      await vi.runAllTimersAsync();

      store.set("text-template", { with: "from template" });

      expect(document.querySelector("p").textContent).toBe("from template");
    });
  });

  describe("setStore action", () => {
    test("on input writes element value to store", async () => {
      store.set("action-input", { with: "" });

      attractive.activate({
        addActions: allBuiltinActions,
        addDirectives: builtinDirectives,
        extendWith: [reactive]
      });

      document.body.innerHTML = `
        <input id="input" @input="setStore#action-input" />
      `;
      await vi.runAllTimersAsync();

      const input = document.getElementById("input");
      input.value = "hi";
      input.dispatchEvent(new Event("input", { bubbles: true }));
      await vi.runAllTimersAsync();

      expect(store.get("action-input")).toBe("hi");
    });

    test("debounce delays store update", async () => {
      attractive.activate({
        addActions: allBuiltinActions,
        addDirectives: builtinDirectives,
        extendWith: [reactive]
      });

      document.body.innerHTML = `
        <input id="input" @input="setStore#action-delay" data-debounce="200" />
      `;
      await Promise.resolve();

      const input = document.getElementById("input");
      input.value = "hello";
      input.dispatchEvent(new Event("input", { bubbles: true }));

      expect(store.get("action-delay")).toBeUndefined();
      expect(vi.getTimerCount()).toBe(1);

      vi.advanceTimersByTime(200);

      expect(store.get("action-delay")).toBe("hello");
    });

    test("on non-input element sets true", async () => {
      attractive.activate({
        addActions: allBuiltinActions,
        addDirectives: builtinDirectives,
        extendWith: [reactive]
      });

      document.body.innerHTML = `
        <button id="btn" @click="setStore#action-active"></button>
      `;
      await vi.runAllTimersAsync();

      document.getElementById("btn").click();
      await vi.runAllTimersAsync();

      expect(store.get("action-active")).toBe(true);
    });
  });

  describe("setStore initial value", () => {
    test("input with value seeds the store", async () => {
      attractive.activate({
        addActions: allBuiltinActions,
        addDirectives: builtinDirectives,
        extendWith: [reactive]
      });

      document.body.innerHTML = `
        <input id="input" @input="setStore#init-name" value="Bob" />
      `;
      await vi.runAllTimersAsync();

      expect(store.get("init-name")).toBe("Bob");
    });

    test("input without value attribute does not seed", async () => {
      attractive.activate({
        addActions: allBuiltinActions,
        addDirectives: builtinDirectives,
        extendWith: [reactive]
      });

      document.body.innerHTML = `
        <input id="input" @input="setStore#init-empty-input" />
      `;
      await vi.runAllTimersAsync();

      expect(store.get("init-empty-input")).toBeUndefined();
    });

    test("input with empty string value does not seed", async () => {
      attractive.activate({
        addActions: allBuiltinActions,
        addDirectives: builtinDirectives,
        extendWith: [reactive]
      });

      document.body.innerHTML = `
        <input id="input" @input="setStore#init-empty-value" value="" />
      `;
      await vi.runAllTimersAsync();

      expect(store.get("init-empty-value")).toBeUndefined();
    });

    test("seed does not overwrite existing store value", async () => {
      store.set("init-existing", { with: "Alice" });

      attractive.activate({
        addActions: allBuiltinActions,
        addDirectives: builtinDirectives,
        extendWith: [reactive]
      });

      document.body.innerHTML = `
        <input @input="setStore#init-existing" value="Bob" />
      `;
      await vi.runAllTimersAsync();

      expect(store.get("init-existing")).toBe("Alice");
    });

    test("select seeds store from selected option", async () => {
      attractive.activate({
        addActions: allBuiltinActions,
        addDirectives: builtinDirectives,
        extendWith: [reactive]
      });

      document.body.innerHTML = `
        <select @change="setStore#init-selected">
          <option value="a">A</option>
          <option value="b" selected>B</option>
          <option value="c">C</option>
        </select>
      `;
      await vi.runAllTimersAsync();

      expect(store.get("init-selected")).toBe("b");
    });
  });

  describe("whenTrue / whenFalse", () => {
    test("whenTrue runs action on truthy store value", async () => {
      attractive.activate({
        addActions: allBuiltinActions,
        addDirectives: builtinDirectives,
        extendWith: [reactive]
      });

      document.body.innerHTML = `
        <div id="el" data-store="st" @action="addClass#fired:whenTrue"></div>
      `;
      await vi.runAllTimersAsync();

      store.set("st", { with: true });
      await vi.runAllTimersAsync();

      expect(document.getElementById("el").classList.contains("fired")).toBe(
        true
      );
    });

    test("whenTrue does not run on falsy store value", async () => {
      store.set("st", { with: false });

      attractive.activate({
        addActions: allBuiltinActions,
        addDirectives: builtinDirectives,
        extendWith: [reactive]
      });

      document.body.innerHTML = `
        <div id="el" data-store="st" @action="addClass#fired:whenTrue"></div>
      `;
      await vi.runAllTimersAsync();

      store.set("st", { with: true });
      await vi.runAllTimersAsync();

      expect(document.getElementById("el").classList.contains("fired")).toBe(
        true
      );
    });

    test("whenFalse runs action on falsy store value", async () => {
      store.set("st", { with: true });

      attractive.activate({
        addActions: allBuiltinActions,
        addDirectives: builtinDirectives,
        extendWith: [reactive]
      });

      document.body.innerHTML = `
        <div id="el" data-store="st" @action="removeAttribute#fired:whenFalse"></div>
      `;
      await vi.runAllTimersAsync();

      store.set("st", { with: false });
      await vi.runAllTimersAsync();

      expect(document.getElementById("el").hasAttribute("fired")).toBe(false);
    });

    test("whenTrue and whenFalse pair for set/remove", async () => {
      attractive.activate({
        addActions: allBuiltinActions,
        addDirectives: builtinDirectives,
        extendWith: [reactive]
      });

      document.body.innerHTML = `
        <div id="el" data-store="st" @action="addAttribute#fired:whenTrue removeAttribute#fired:whenFalse"></div>
      `;
      await vi.runAllTimersAsync();

      store.set("st", { with: true });
      await vi.runAllTimersAsync();
      expect(document.getElementById("el").hasAttribute("fired")).toBe(true);

      store.set("st", { with: false });
      await vi.runAllTimersAsync();
      expect(document.getElementById("el").hasAttribute("fired")).toBe(false);
    });

    test("does not run when store.set is never called", async () => {
      attractive.activate({
        addActions: allBuiltinActions,
        addDirectives: builtinDirectives,
        extendWith: [reactive]
      });

      document.body.innerHTML = `
        <div id="el" data-store="st" @action="addClass#fired:whenTrue"></div>
      `;
      await vi.runAllTimersAsync();

      expect(document.getElementById("el").classList.contains("fired")).toBe(
        false
      );
    });

    test("works with element in initial HTML", async () => {
      document.body.innerHTML = `
        <div id="el" data-store="st" @action="addClass#fired:whenTrue"></div>
      `;

      attractive.activate({
        addActions: allBuiltinActions,
        addDirectives: builtinDirectives,
        extendWith: [reactive]
      });
      await vi.runAllTimersAsync();

      store.set("st", { with: true });
      await vi.runAllTimersAsync();

      expect(document.getElementById("el").classList.contains("fired")).toBe(
        true
      );
    });
  });
});
