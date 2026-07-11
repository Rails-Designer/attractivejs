import { describe, test, expect, beforeEach, vi } from "vitest";
import Attractive from "../../src/index.js";
import Core from "../../src/core.js";
import builtinActions from "../../src/actions/index.js";
import { addClass, removeClass } from "../../src/actions/class.js";
import { remove } from "../../src/actions/element.js";
import { defaultDirectives } from "../../src/core/builtin_directives.js";

globalThis.Node = globalThis.Node || { ELEMENT_NODE: 1 };

describe("Core build with selective actions", () => {
  beforeEach(() => {
    document.body.innerHTML = "";

    vi.clearAllTimers();
    vi.useFakeTimers();
  });

  test("registers actions and makes them available", async () => {
    const attractive = new Core();

    attractive.addAction("addClass", addClass);
    attractive.registerDirectives((directives) => {
      defaultDirectives(directives);
    });
    attractive.activate();

    document.body.innerHTML = `
      <button id="btn" @action="addClass#active" @target="target">
        <span id="target">Target</span>
      </button>
    `;

    await vi.runAllTimersAsync();

    document.getElementById("btn").click();

    const target = document.getElementById("target");
    expect(target.classList.contains("active")).toBe(true);
  });

  test("registers actions from different modules", async () => {
    const attractive = new Core();

    attractive.addAction("addClass", addClass);
    attractive.addAction("remove", remove);

    attractive.registerDirectives((directives) => {
      defaultDirectives(directives);
    });
    attractive.activate();

    document.body.innerHTML = `
      <div id="container">
        <div id="target">Remove me</div>
      </div>
      <button id="btn" @action="remove" @target="target">Remove</button>
    `;

    await vi.runAllTimersAsync();

    document.getElementById("btn").click();

    expect(document.getElementById("target")).toBeNull();
  });

  test("registers multiple actions from a single module", async () => {
    const attractive = new Core();

    attractive.addAction("addClass", addClass);
    attractive.addAction("removeClass", removeClass);

    attractive.registerDirectives((directives) => {
      defaultDirectives(directives);
    });
    attractive.activate();

    document.body.innerHTML = `
      <button id="btn" @action="removeClass#inactive" @target="target">
        <span id="target" class="inactive">Target</span>
      </button>
    `;

    await vi.runAllTimersAsync();

    document.getElementById("btn").click();

    const target = document.getElementById("target");
    expect(target.classList.contains("inactive")).toBe(false);
  });

  test("unregistered actions are not available", async () => {
    const attractive = new Core();

    attractive.addAction("addClass", addClass);

    attractive.registerDirectives((directives) => {
      defaultDirectives(directives);
    });
    attractive.activate();

    document.body.innerHTML = `
      <button id="btn" @action="copy">Copy</button>
    `;

    await vi.runAllTimersAsync();

    expect(() => {
      document.getElementById("btn").click();
    }).not.toThrow();
  });

  test("addActions registers multiple actions at once", async () => {
    const attractive = new Core();

    attractive.addActions({ addClass, removeClass });

    attractive.registerDirectives((directives) => {
      defaultDirectives(directives);
    });
    attractive.activate();

    document.body.innerHTML = `
      <button id="btn" @action="removeClass#inactive" @target="target">
        <span id="target" class="inactive">Target</span>
      </button>
    `;

    await vi.runAllTimersAsync();

    document.getElementById("btn").click();

    const target = document.getElementById("target");
    expect(target.classList.contains("inactive")).toBe(false);
  });

  test("@ shorthand works for default event action", async () => {
    const attractive = new Attractive();

    attractive.registerActions((registry) => {
      Object.entries(builtinActions).forEach(([name, action]) =>
        registry.addAction(name, action)
      );
    });

    attractive.registerDirectives((directives) => {
      defaultDirectives(directives);
    });
    attractive.activate();

    document.body.innerHTML = `
      <button id="btn" @="addClass#toggled" @target="target">
        <span id="target">Target</span>
      </button>
    `;

    await vi.runAllTimersAsync();

    document.getElementById("btn").click();

    const target = document.getElementById("target");
    expect(target.classList.contains("toggled")).toBe(true);
  });

  test("data-action backward compat works when no @action present", async () => {
    const attractive = new Attractive();

    attractive.registerActions((registry) => {
      Object.entries(builtinActions).forEach(([name, action]) =>
        registry.addAction(name, action)
      );
    });

    attractive.registerDirectives((directives) => {
      defaultDirectives(directives);
    });
    attractive.activate();

    document.body.innerHTML = `
      <button id="btn" data-action="addClass#toggled" data-target="target">
        <span id="target">Target</span>
      </button>
    `;

    await vi.runAllTimersAsync();

    document.getElementById("btn").click();

    const target = document.getElementById("target");
    expect(target.classList.contains("toggled")).toBe(true);
  });

  test("@action takes priority over data-action", async () => {
    const attractive = new Attractive();

    attractive.registerActions((registry) => {
      Object.entries(builtinActions).forEach(([name, action]) =>
        registry.addAction(name, action)
      );
    });

    attractive.registerDirectives((directives) => {
      defaultDirectives(directives);
    });
    attractive.activate();

    document.body.innerHTML = `
      <button id="btn" @action="addClass#primary" data-action="addClass#ignored" @target="target">
        <span id="target">Target</span>
      </button>
    `;

    await vi.runAllTimersAsync();

    document.getElementById("btn").click();

    const target = document.getElementById("target");
    expect(target.classList.contains("primary")).toBe(true);
    expect(target.classList.contains("ignored")).toBe(false);
  });

  test("addTriggers/addGates register directives at once", async () => {
    const attractive = new Core();

    attractive.addAction("addClass", addClass);
    attractive.addGates({ enabled: (_context) => true });

    attractive.registerDirectives((directives) => {
      defaultDirectives(directives);
    });
    attractive.activate();

    document.body.innerHTML = `
      <button id="btn" @action="addClass#active:enabled" @target="target">
        <span id="target">Target</span>
      </button>
    `;

    await vi.runAllTimersAsync();

    document.getElementById("btn").click();

    const target = document.getElementById("target");
    expect(target.classList.contains("active")).toBe(true);
  });

  test("action on template element processes correctly", async () => {
    const attractive = new Attractive();

    attractive.registerActions((registry) => {
      Object.entries(builtinActions).forEach(([name, action]) =>
        registry.addAction(name, action)
      );
    });

    attractive.registerDirectives((directives) => {
      defaultDirectives(directives);
    });
    attractive.activate();

    document.body.innerHTML = `
      <template @action="focus" @target="inputField">Content</template>
      <input id="inputField" type="text">
    `;

    await vi.runAllTimersAsync();

    const input = document.getElementById("inputField");
    const focusSpy = vi.spyOn(input, "focus");

    document.querySelector("template").click();

    expect(focusSpy).toHaveBeenCalled();
  });
});
