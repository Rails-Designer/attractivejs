import { test, expect, beforeEach, vi } from "vitest";
import Attractive from "../../src/index.js";
import builtinActions from "../../src/actions/index.js";
import { defaultDirectives } from "../../src/core/builtin_directives.js";

globalThis.Node = globalThis.Node || { ELEMENT_NODE: 1 };

let attractive;

beforeEach(() => {
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

test("action context includes event for event-triggered actions", async () => {
  let receivedEvent;

  attractive.addAction("captureEvent", (element, { event }) => {
    receivedEvent = event;
  });

  attractive.activate();

  document.body.innerHTML = `
    <button id="btn" @action="captureEvent">Click</button>
  `;

  await vi.runAllTimersAsync();

  document.getElementById("btn").click();

  await vi.runAllTimersAsync();

  expect(receivedEvent).toBeInstanceOf(MouseEvent);
  expect(receivedEvent.type).toBe("click");
});

test("action context includes dataset", async () => {
  let receivedDataset;

  attractive.addAction("captureDataset", (element, { dataset }) => {
    receivedDataset = dataset;
  });

  attractive.activate();

  document.body.innerHTML = `
    <button id="btn" @action="captureDataset" data-custom="hello">Click</button>
  `;

  await vi.runAllTimersAsync();

  document.getElementById("btn").click();

  await vi.runAllTimersAsync();

  expect(receivedDataset.custom).toBe("hello");
});

test("old-style handler destructuring still works", async () => {
  let receivedValue = null;

  attractive.addAction("oldStyle", (element, { value }) => {
    receivedValue = value;
  });

  attractive.activate();

  document.body.innerHTML = `
    <button id="btn" @action="oldStyle#hello">Click</button>
  `;

  await vi.runAllTimersAsync();

  document.getElementById("btn").click();

  await vi.runAllTimersAsync();

  expect(receivedValue).toBe("hello");
});
