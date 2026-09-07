import { describe, test, expect, beforeEach, vi } from "vitest";

import Attractive from "../../src/index.js";
import builtinActions from "../../src/actions/index.js";
import {
  builtinGates,
  builtinTriggers
} from "../../src/core/builtin_directives.js";
import { reactive } from "../../src/addons/reactive/index.js";
import { setStore } from "../../src/addons/reactive/actions/set_store.js";
import { store, subscribe } from "../../src/addons/reactive/store.js";
import { js } from "../../src/actions/inline.js";

const actions = builtinActions;

let attractive;

beforeEach(() => {
  if (attractive) attractive.deactivate();
  document.body.innerHTML = "";
  vi.clearAllTimers();
  vi.useFakeTimers();
  delete globalThis.$store;

  attractive = new Attractive();
});

const activate = () =>
  attractive.activate({
    addActions: actions,
    addGates: builtinGates,
    addTriggers: builtinTriggers,
    extendWith: [reactive]
  });

describe("reactive v2", () => {
  describe("store", () => {
    test("set/get with dot-paths and auto-created objects", () => {
      store.set("user.name", "Cam");
      expect(store.get("user.name")).toBe("Cam");
      expect(store.get("user").name).toBe("Cam");
    });

    test("clear empties the tree and notifies with undefined", () => {
      const fn = vi.fn();
      store.set("a", 1);
      subscribe("a", fn);
      store.clear();
      expect(store.get("a")).toBeUndefined();
      expect(fn).toHaveBeenCalledWith(undefined);
    });

    test("nested set notifies ancestor subscribers", () => {
      const fn = vi.fn();
      subscribe("user", fn);
      store.set("user.name", "Cam");
      expect(fn).toHaveBeenCalledWith(store.get("user"));
    });
  });

  describe("@text binding", () => {
    test("renders and updates from the store", async () => {
      store.set("greeting", "Hi");
      activate();
      document.body.innerHTML = `<p @text="greeting"></p>`;
      await vi.runAllTimersAsync();
      expect(document.querySelector("p").textContent).toBe("Hi");

      store.set("greeting", "Bye");
      expect(document.querySelector("p").textContent).toBe("Bye");
    });

    test("hydrates from <script type=application/json data-store>", async () => {
      document.body.innerHTML = `
        <script type="application/json" data-store>
          { "user": { "online": true }, "unread": 2 }
        </script>
        <span id="badge" @text="unread"></span>`;
      activate();
      await vi.runAllTimersAsync();
      expect(store.get("unread")).toBe(2);
      expect(document.getElementById("badge").textContent).toBe("2");
    });
  });

  describe("setStore", () => {
    test("input writes its string value", async () => {
      activate();
      document.body.innerHTML = `<input id="i" @input="setStore#name" />`;
      await vi.runAllTimersAsync();
      const input = document.getElementById("i");
      input.value = "Cam";
      input.dispatchEvent(new Event("input", { bubbles: true }));
      await vi.runAllTimersAsync();
      expect(store.get("name")).toBe("Cam");
    });

    test("non-input with no value sets true (not coerced to 1)", async () => {
      activate();
      document.body.innerHTML = `<button id="b" @click="setStore#active"></button>`;
      await vi.runAllTimersAsync();
      document.getElementById("b").click();
      await vi.runAllTimersAsync();
      expect(store.get("active")).toBe(true);
    });

    test("key=value coerces literals", async () => {
      activate();
      document.body.innerHTML = `<button id="b" @click="setStore#flag=true"></button>`;
      await vi.runAllTimersAsync();
      document.getElementById("b").click();
      await vi.runAllTimersAsync();
      expect(store.get("flag")).toBe(true);
    });

    test("server payload writes state via data (primitive + object)", () => {
      activate();
      setStore(null, { value: "unread", data: 0 });
      setStore(null, { value: "user.online", data: false });
      expect(store.get("unread")).toBe(0);
      expect(store.get("user.online")).toBe(false);
    });
  });

  describe("inStore bridge", () => {
    test("value-aware setClass toggles by store value", async () => {
      activate();
      document.body.innerHTML = `<span id="dot" data-store="user.online" @action="setClass#online:inStore"></span>`;
      await vi.runAllTimersAsync();

      store.set("user.online", true);
      await vi.runAllTimersAsync();
      expect(document.getElementById("dot").classList.contains("online")).toBe(
        true
      );

      store.set("user.online", false);
      await vi.runAllTimersAsync();
      expect(document.getElementById("dot").classList.contains("online")).toBe(
        false
      );
    });

    test("applies current value at bind, ignores unset path", async () => {
      store.set("ready", true);
      activate();
      document.body.innerHTML = `
        <div id="a" data-store="ready" @action="setClass#ready:inStore"></div>
        <div id="b" class="keep" data-store="absent" @action="setClass#ready:inStore"></div>`;
      await vi.runAllTimersAsync();
      expect(document.getElementById("a").classList.contains("ready")).toBe(
        true
      );
      expect(document.getElementById("b").classList.contains("ready")).toBe(
        false
      );
      expect(document.getElementById("b").classList.contains("keep")).toBe(
        true
      );
    });
  });

  describe("$store in js", () => {
    test("exposes the store when js is registered", async () => {
      store.set("count", 1);
      attractive.activate({
        addActions: { ...actions, js },
        addGates: builtinGates,
        addTriggers: builtinTriggers,
        extendWith: [reactive]
      });
      document.body.innerHTML = `<button id="b" @click="js:$store.set('count', $store.get('count') + 1)">+1</button>`;
      await vi.runAllTimersAsync();
      document.getElementById("b").click();
      await vi.runAllTimersAsync();
      expect(store.get("count")).toBe(2);
    });
  });
});
