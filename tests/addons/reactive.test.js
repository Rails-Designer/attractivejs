import { describe, test, expect, beforeEach, vi } from "vitest";

import Attractive from "../../src/index.js";
import builtinActions from "../../src/actions/index.js";
import { defaultDirectives } from "../../src/core/builtin_directives.js";
import { reactive } from "../../src/addons/reactive/index.js";
import { store } from "../../src/addons/reactive/store.js";

let attractive;

describe("Reactive addon", () => {
  beforeEach(() => {
    if (attractive) attractive.deactivate();
    document.body.innerHTML = "";
    vi.clearAllTimers();
    vi.useFakeTimers();

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

  describe("Store", () => {
    test("set and get a value", () => {
      store.set("name", { with: "Alice" });
      expect(store.get("name")).toBe("Alice");
    });

    test("get returns undefined for unset key", () => {
      expect(store.get("nonexistent")).toBeUndefined();
    });
  });

  describe("@text binding", () => {
    test("sets initial textContent from store", async () => {
      store.set("text-greeting", { with: "Hello" });

      attractive.activate({ extendWith: [reactive] });

      document.body.innerHTML = `<p @text="text-greeting"></p>`;
      await vi.runAllTimersAsync();

      const p = document.querySelector("p");
      expect(p.textContent).toBe("Hello");
    });

    test("updates textContent on store change", async () => {
      attractive.activate({ extendWith: [reactive] });

      document.body.innerHTML = `<p id="p" @text="text-update"></p>`;
      await vi.runAllTimersAsync();

      store.set("text-update", { with: "Hello, Alice!" });

      expect(document.getElementById("p").textContent).toBe("Hello, Alice!");
    });

    test("shows empty string for unset key", () => {
      attractive.activate({ extendWith: [reactive] });

      document.body.innerHTML = `<p @text="text-unset"></p>`;

      const p = document.querySelector("p");
      expect(p.textContent).toBe("");
    });

    test("preserves element content when store has no value for the key", async () => {
      attractive.activate({ extendWith: [reactive] });

      document.body.innerHTML = `<span @text="text-preserve">Betty</span>`;
      await vi.runAllTimersAsync();

      const span = document.querySelector("span");
      expect(span.textContent).toBe("Betty");
    });

    test("element content seeds the store when no value is set", async () => {
      attractive.activate({ extendWith: [reactive] });

      document.body.innerHTML = `<span @text="text-seed">Betty</span>`;
      await vi.runAllTimersAsync();

      expect(store.get("text-seed")).toBe("Betty");
    });

    test("seeded value updates when store is set", async () => {
      attractive.activate({ extendWith: [reactive] });

      document.body.innerHTML = `<span id="s" @text="text-seeded">Betty</span>`;
      await vi.runAllTimersAsync();

      store.set("text-seeded", { with: "Alice" });

      expect(document.getElementById("s").textContent).toBe("Alice");
    });

    test("shows empty string for null value", () => {
      store.set("text-null", { with: null });

      attractive.activate({ extendWith: [reactive] });

      document.body.innerHTML = `<p @text="text-null"></p>`;

      const p = document.querySelector("p");
      expect(p.textContent).toBe("");
    });

    test("shows empty string for undefined value", () => {
      store.set("text-undefined", { with: undefined });

      attractive.activate({ extendWith: [reactive] });

      document.body.innerHTML = `<p @text="text-undefined"></p>`;

      const p = document.querySelector("p");
      expect(p.textContent).toBe("");
    });

    test("multiple elements bound to same key all update", async () => {
      attractive.activate({ extendWith: [reactive] });

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

      attractive.activate({ extendWith: [reactive] });

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
      attractive.activate({ extendWith: [reactive] });

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

      attractive.activate({ extendWith: [reactive] });

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
      attractive.activate({ extendWith: [reactive] });

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
      attractive.activate({ extendWith: [reactive] });

      document.body.innerHTML = `
        <button id="btn" @click="setStore#action-active"></button>
      `;
      await vi.runAllTimersAsync();

      document.getElementById("btn").click();
      await vi.runAllTimersAsync();

      expect(store.get("action-active")).toBe(true);
    });
  });

  describe("whenTrue / whenFalse", () => {
    test("whenTrue fires action on truthy store value", async () => {
      attractive.activate({ extendWith: [reactive] });

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

    test("whenTrue does not fire on falsy store value", async () => {
      store.set("st", { with: false });

      attractive.activate({ extendWith: [reactive] });

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

    test("whenFalse fires action on falsy store value", async () => {
      store.set("st", { with: true });

      attractive.activate({ extendWith: [reactive] });

      document.body.innerHTML = `
        <div id="el" data-store="st" @action="removeAttribute#fired:whenFalse"></div>
      `;
      await vi.runAllTimersAsync();

      store.set("st", { with: false });
      await vi.runAllTimersAsync();

      expect(document.getElementById("el").hasAttribute("fired")).toBe(false);
    });

    test("whenTrue and whenFalse pair for set/remove", async () => {
      attractive.activate({ extendWith: [reactive] });

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

    test("does not fire when store.set is never called", async () => {
      attractive.activate({ extendWith: [reactive] });

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

      attractive.activate({ extendWith: [reactive] });
      await vi.runAllTimersAsync();

      store.set("st", { with: true });
      await vi.runAllTimersAsync();

      expect(document.getElementById("el").classList.contains("fired")).toBe(
        true
      );
    });
  });
});
