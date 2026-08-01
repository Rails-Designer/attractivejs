import { describe, test, expect, beforeEach, vi } from "vitest";

import Attractive from "../../src/index.js";
import builtinActions from "../../src/actions/index.js";
import {
  builtinGates,
  builtinTriggers
} from "../../src/core/builtin_directives.js";
import { Template } from "../../src/addons/attract/template.js";
import { attract } from "../../src/addons/attract/index.js";
import { reactive } from "../../src/addons/reactive/index.js";
import Debug from "../../src/debug.js";

const allBuiltinActions = builtinActions;

let attractive;

beforeEach(() => {
  document.body.innerHTML = "";
});

describe("Template", () => {
  beforeEach(() => {
    document.body.innerHTML = "";
  });

  test("appends template clone to target", () => {
    document.body.innerHTML = `
      <template id="card"><div class="item">content</div></template>
      <div id="list"></div>
    `;

    new Template("card").render({
      target: "list",
      position: "append",
      with: {}
    });

    const list = document.getElementById("list");
    expect(list.children).toHaveLength(1);
    expect(list.children[0].textContent).toBe("content");
  });

  test("prepends template clone before existing content", () => {
    document.body.innerHTML = `
      <template id="card"><div class="item">new</div></template>
      <div id="list"><div class="item">existing</div></div>
    `;

    new Template("card").render({
      target: "list",
      position: "prepend",
      with: {}
    });

    const list = document.getElementById("list");
    expect(list.children).toHaveLength(2);
    expect(list.children[0].textContent).toBe("new");
  });

  test("replaces target element", () => {
    document.body.innerHTML = `
      <template id="card"><div class="replacement">replaced</div></template>
      <div id="original">original</div>
    `;

    new Template("card").render({
      target: "original",
      position: "replace",
      with: {}
    });

    const replacement = document.querySelector(".replacement");
    expect(replacement).toBeTruthy();
    expect(replacement.textContent).toBe("replaced");
    expect(document.getElementById("original")).toBeNull();
  });

  test("removes target elements", () => {
    document.body.innerHTML = `<div id="gone"></div>`;

    new Template(null).render({
      target: "gone",
      position: "remove",
      with: {}
    });

    expect(document.getElementById("gone")).toBeNull();
  });

  test("renders each item from array data", () => {
    document.body.innerHTML = `
      <template id="card"><div class="item"></div></template>
      <div id="list"></div>
    `;

    new Template("card").render({
      target: "list",
      position: "append",
      with: [{}, {}]
    });

    const list = document.getElementById("list");
    expect(list.children).toHaveLength(2);
  });

  test("warns on missing template", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    document.body.innerHTML = `<div id="target"></div>`;
    Debug.enabled = true;

    new Template("nonexistent").render({
      target: "target",
      position: "append",
      with: {}
    });

    expect(warn).toHaveBeenCalled();
    Debug.enabled = false;
    warn.mockRestore();
  });

  test("sets textContent via attract-field on clone", () => {
    document.body.innerHTML = `
      <template id="card"><div attract-field="name"></div></template>
      <div id="list"></div>
    `;

    new Template("card").render({
      target: "list",
      position: "append",
      with: { name: "Alice" }
    });

    const clone = document.querySelector("#list > div");
    expect(clone).toBeTruthy();
    expect(clone.textContent).toBe("Alice");
  });

  test("preserves attract-field on clone after render", () => {
    document.body.innerHTML = `
      <template id="card"><div attract-field="name"></div></template>
      <div id="list"></div>
    `;

    new Template("card").render({
      target: "list",
      position: "append",
      with: { name: "Alice" }
    });

    const clone = document.querySelector("#list > div");
    expect(clone).toBeTruthy();
    expect(clone.textContent).toBe("Alice");
    expect(clone.hasAttribute("attract-field")).toBe(true);
  });

  test("sets input value via attract-field", () => {
    document.body.innerHTML = `
      <template id="card"><input attract-field="title" /></template>
      <div id="list"></div>
    `;

    new Template("card").render({
      target: "list",
      position: "append",
      with: { title: "Hello" }
    });

    const clone = document.querySelector("#list > input");
    expect(clone.value).toBe("Hello");
  });

  test("sets checkbox checked via attract-field", () => {
    document.body.innerHTML = `
      <template id="card"><input type="checkbox" attract-field="active" /></template>
      <div id="list"></div>
    `;

    new Template("card").render({
      target: "list",
      position: "append",
      with: { active: true }
    });

    const clone = document.querySelector("#list > input");
    expect(clone.checked).toBe(true);
  });
});

describe("attract addon", () => {
  beforeEach(() => {
    if (attractive) attractive.deactivate();
    document.body.innerHTML = "";
    vi.clearAllTimers();
    vi.useFakeTimers();

    attractive = new Attractive();
  });

  test("activates without error alongside reactive", () => {
    attractive.activate({
      addActions: allBuiltinActions,
      addGates: builtinGates,
      addTriggers: builtinTriggers,
      extendWith: [reactive, attract]
    });
    expect(attractive.active).toBe(true);
  });

  test("activates standalone without reactive", () => {
    attractive.activate({
      addActions: allBuiltinActions,
      addGates: builtinGates,
      addTriggers: builtinTriggers,
      extendWith: [attract]
    });
    expect(attractive.active).toBe(true);
  });

  test("renders attract-field from form data optimistically", () => {
    const fetchMock = vi.fn().mockReturnValue(new Promise(() => {}));
    globalThis.fetch = fetchMock;

    document.body.innerHTML = `
      <template id="card"><div attract-field="title"></div></template>
      <form @attract action="/messages" method="post"
            data-attract-template="card" data-attract-target="list">
        <input name="title" value="Hello" />
        <button>Submit</button>
      </form>
      <div id="list"></div>
    `;

    attractive.activate({
      addActions: allBuiltinActions,
      addGates: builtinGates,
      addTriggers: builtinTriggers,
      extendWith: [attract]
    });

    const form = document.querySelector("form");
    form.dispatchEvent(
      new Event("submit", { bubbles: true, cancelable: true })
    );

    const list = document.getElementById("list");
    expect(list.children).toHaveLength(1);
    expect(list.children[0].textContent).toBe("Hello");
  });

  test("sets busy on form submit before fetch resolves", () => {
    const fetchMock = vi.fn().mockReturnValue(new Promise(() => {}));
    globalThis.fetch = fetchMock;

    document.body.innerHTML = `
      <form @attract action="/messages" method="post">
        <input name="body" value="hello" />
        <button>Submit</button>
      </form>
    `;

    attractive.activate({
      addActions: allBuiltinActions,
      addGates: builtinGates,
      addTriggers: builtinTriggers,
      extendWith: [attract]
    });

    const form = document.querySelector("form");
    form.dispatchEvent(
      new Event("submit", { bubbles: true, cancelable: true })
    );

    expect(form.hasAttribute("data-attract-busy")).toBe(true);
  });

  test("sets success on ok response", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      headers: new Headers({ "Content-Type": "application/json" }),
      json: () => Promise.resolve({})
    });
    globalThis.fetch = fetchMock;

    document.body.innerHTML = `
      <form @attract action="/messages" method="post">
        <input name="body" value="hello" />
        <button>Submit</button>
      </form>
    `;

    attractive.activate({
      addActions: allBuiltinActions,
      addGates: builtinGates,
      addTriggers: builtinTriggers,
      extendWith: [attract]
    });

    const form = document.querySelector("form");
    form.dispatchEvent(
      new Event("submit", { bubbles: true, cancelable: true })
    );
    await vi.runAllTimersAsync();

    expect(form.getAttribute("data-attract-success")).toBe("true");
  });

  test("sets error on failed response", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: false,
      status: 422,
      headers: new Headers({ "Content-Type": "application/json" }),
      json: () => Promise.resolve({ errors: { body: "can't be blank" } })
    });
    globalThis.fetch = fetchMock;

    document.body.innerHTML = `
      <form @attract action="/messages" method="post">
        <input name="body" value="" />
        <button>Submit</button>
      </form>
    `;

    attractive.activate({
      addActions: allBuiltinActions,
      addGates: builtinGates,
      addTriggers: builtinTriggers,
      extendWith: [attract]
    });

    const form = document.querySelector("form");
    form.dispatchEvent(
      new Event("submit", { bubbles: true, cancelable: true })
    );
    await vi.runAllTimersAsync();

    expect(form.getAttribute("data-attract-error")).toBe("true");
  });

  test("sets custom validity on field errors", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: false,
      status: 422,
      headers: new Headers({ "Content-Type": "application/json" }),
      json: () => Promise.resolve({ errors: { body: "can't be blank" } })
    });
    globalThis.fetch = fetchMock;

    document.body.innerHTML = `
      <form @attract action="/messages" method="post">
        <input name="body" value="" />
        <button>Submit</button>
      </form>
    `;

    attractive.activate({
      addActions: allBuiltinActions,
      addGates: builtinGates,
      addTriggers: builtinTriggers,
      extendWith: [attract]
    });

    const form = document.querySelector("form");
    const input = document.querySelector("input");
    form.dispatchEvent(
      new Event("submit", { bubbles: true, cancelable: true })
    );
    await vi.runAllTimersAsync();

    expect(input.validationMessage).toBe("can't be blank");
  });

  test("clears custom validity on input allowing resubmit after error", async () => {
    let callCount = 0;
    const fetchMock = vi.fn().mockImplementation(() => {
      callCount++;
      if (callCount === 1) {
        return Promise.resolve({
          ok: false,
          status: 422,
          headers: new Headers({ "Content-Type": "application/json" }),
          json: () => Promise.resolve({ errors: { body: "can't be blank" } })
        });
      }
      return Promise.resolve({
        ok: true,
        headers: new Headers({ "Content-Type": "application/json" }),
        json: () => Promise.resolve({})
      });
    });
    globalThis.fetch = fetchMock;

    document.body.innerHTML = `
      <form @attract action="/messages" method="post">
        <input name="body" value="" />
        <button>Submit</button>
      </form>
    `;

    attractive.activate({
      addActions: allBuiltinActions,
      addGates: builtinGates,
      addTriggers: builtinTriggers,
      extendWith: [attract]
    });

    const form = document.querySelector("form");
    const input = document.querySelector("input");

    form.dispatchEvent(
      new Event("submit", { bubbles: true, cancelable: true })
    );
    await vi.runAllTimersAsync();
    expect(input.validationMessage).toBe("can't be blank");

    input.value = "hello";
    input.dispatchEvent(new Event("input", { bubbles: true }));
    expect(input.validationMessage).toBe("");

    form.dispatchEvent(
      new Event("submit", { bubbles: true, cancelable: true })
    );
    await vi.runAllTimersAsync();
    expect(form.getAttribute("data-attract-success")).toBe("true");
  });

  test("intercepts form inside container with @attract", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      headers: new Headers({ "Content-Type": "application/json" }),
      json: () => Promise.resolve({})
    });
    globalThis.fetch = fetchMock;

    document.body.innerHTML = `
      <div @attract>
        <form action="/messages" method="post">
          <input name="body" value="hello" />
          <button>Submit</button>
        </form>
      </div>
    `;

    attractive.activate({
      addActions: allBuiltinActions,
      addGates: builtinGates,
      addTriggers: builtinTriggers,
      extendWith: [attract]
    });

    const form = document.querySelector("form");
    form.dispatchEvent(
      new Event("submit", { bubbles: true, cancelable: true })
    );
    await vi.runAllTimersAsync();

    expect(fetchMock).toHaveBeenCalled();
  });

  test("processes actions from response", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      headers: new Headers({ "Content-Type": "application/json" }),
      json: () =>
        Promise.resolve({
          actions: [
            {
              action: "append",
              template: "card",
              target: "list",
              data: { title: "Hello" }
            }
          ]
        })
    });
    globalThis.fetch = fetchMock;

    document.body.innerHTML = `
      <template id="card"><div class="item">dynamic</div></template>
      <form @attract action="/messages" method="post">
        <input name="title" value="Hello" />
        <button>Submit</button>
      </form>
      <div id="list"></div>
    `;

    attractive.activate({
      addActions: allBuiltinActions,
      addGates: builtinGates,
      addTriggers: builtinTriggers,
      extendWith: [attract]
    });

    const form = document.querySelector("form");
    form.dispatchEvent(
      new Event("submit", { bubbles: true, cancelable: true })
    );
    await vi.runAllTimersAsync();

    const list = document.getElementById("list");
    expect(list.children).toHaveLength(1);
    expect(list.children[0].textContent).toBe("dynamic");
  });

  test("processes actions with attract-field from response", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      headers: new Headers({ "Content-Type": "application/json" }),
      json: () =>
        Promise.resolve({
          actions: [
            {
              action: "append",
              template: "card",
              target: "list",
              data: { title: "Hello" }
            }
          ]
        })
    });
    globalThis.fetch = fetchMock;

    document.body.innerHTML = `
      <template id="card"><div attract-field="title"></div></template>
      <form @attract action="/messages" method="post">
        <input name="title" value="Hello" />
        <button>Submit</button>
      </form>
      <div id="list"></div>
    `;

    attractive.activate({
      addActions: allBuiltinActions,
      addGates: builtinGates,
      addTriggers: builtinTriggers,
      extendWith: [attract]
    });

    const form = document.querySelector("form");
    form.dispatchEvent(
      new Event("submit", { bubbles: true, cancelable: true })
    );
    await vi.runAllTimersAsync();

    const list = document.getElementById("list");
    expect(list.children).toHaveLength(1);
    expect(list.children[0].textContent).toBe("Hello");
  });

  test("processes actions with array data and attract-field from response", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      headers: new Headers({ "Content-Type": "application/json" }),
      json: () =>
        Promise.resolve({
          actions: [
            {
              action: "append",
              template: "card",
              target: "list",
              data: [{ title: "First" }, { title: "Second" }]
            }
          ]
        })
    });
    globalThis.fetch = fetchMock;

    document.body.innerHTML = `
      <template id="card"><div attract-field="title"></div></template>
      <form @attract action="/messages" method="post">
        <input name="title" value="" />
        <button>Submit</button>
      </form>
      <div id="list"></div>
    `;

    attractive.activate({
      addActions: allBuiltinActions,
      addGates: builtinGates,
      addTriggers: builtinTriggers,
      extendWith: [attract]
    });

    const form = document.querySelector("form");
    form.dispatchEvent(
      new Event("submit", { bubbles: true, cancelable: true })
    );
    await vi.runAllTimersAsync();

    const list = document.getElementById("list");
    expect(list.children).toHaveLength(2);
    expect(list.children[0].textContent).toBe("First");
    expect(list.children[1].textContent).toBe("Second");
  });

  test("registers append action accessible via @action", () => {
    document.body.innerHTML = `
      <template id="card"><div class="item">registered</div></template>
      <div id="list"></div>
      <button @action="append#card" @target="list">Add</button>
    `;

    attractive.activate({
      addActions: allBuiltinActions,
      addGates: builtinGates,
      addTriggers: builtinTriggers,
      extendWith: [attract]
    });

    const list = document.getElementById("list");
    const button = document.querySelector("button");
    button.click();

    expect(list.children).toHaveLength(1);
    expect(list.children[0].textContent).toBe("registered");
  });
});

describe("actions", () => {
  beforeEach(() => {
    document.body.innerHTML = "";
  });

  describe("append", () => {
    test("clones template and appends to target", async () => {
      const { append } = await import("../../src/addons/attract/actions.js");

      document.body.innerHTML = `
        <template id="card"><div class="item">hello</div></template>
        <div id="list"></div>
      `;

      const button = document.createElement("button");
      button.dataset.template = "card";

      append(button, {
        target: "list",
        value: null,
        dataset: button.dataset
      });

      const list = document.getElementById("list");
      expect(list.children).toHaveLength(1);
      expect(list.children[0].textContent).toBe("hello");
    });

    test("reads template from action value", async () => {
      const { append } = await import("../../src/addons/attract/actions.js");

      document.body.innerHTML = `
        <template id="card"><div class="item">from value</div></template>
        <div id="list"></div>
      `;

      const button = document.createElement("button");

      append(button, {
        target: "list",
        value: "card",
        dataset: button.dataset
      });

      const list = document.getElementById("list");
      expect(list.children[0].textContent).toBe("from value");
    });
  });

  describe("remove", () => {
    test("removes target element", async () => {
      const { remove } = await import("../../src/addons/attract/actions.js");

      document.body.innerHTML = `<div id="gone"></div>`;

      const button = document.createElement("button");

      remove(button, { target: "gone" });

      expect(document.getElementById("gone")).toBeNull();
    });

    test("removes the host element when no target is given", async () => {
      const { remove } = await import("../../src/addons/attract/actions.js");

      document.body.innerHTML = `<li id="flash">message</li>`;

      remove(document.getElementById("flash"), {});

      expect(document.getElementById("flash")).toBeNull();
    });
  });
});
