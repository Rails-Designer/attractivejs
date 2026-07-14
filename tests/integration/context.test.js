import { test, expect, beforeEach, vi } from "vitest";
import Attractive from "../../src/index.js";
import builtinActions from "../../src/actions/index.js";
import { builtinDirectives } from "../../src/core/builtin_directives.js";

globalThis.Node = globalThis.Node || { ELEMENT_NODE: 1 };

const allBuiltinActions = builtinActions;

let attractive;

beforeEach(() => {
  document.body.innerHTML = "";
  vi.clearAllTimers();
  vi.useFakeTimers();

  attractive = new Attractive();
});

test("action context includes event for event-triggered actions", async () => {
  let receivedEvent;

  attractive.activate({
    addActions: {
      ...allBuiltinActions,
      captureEvent: (element, { event }) => {
        receivedEvent = event;
      }
    },
    addDirectives: builtinDirectives
  });

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

  attractive.activate({
    addActions: {
      ...allBuiltinActions,
      captureDataset: (element, { dataset }) => {
        receivedDataset = dataset;
      }
    },
    addDirectives: builtinDirectives
  });

  document.body.innerHTML = `
    <button id="btn" @action="captureDataset" data-custom="hello">Click</button>
  `;

  await vi.runAllTimersAsync();

  document.getElementById("btn").click();

  await vi.runAllTimersAsync();

  expect(receivedDataset.custom).toBe("hello");
});

test("old-style action destructuring still works", async () => {
  let receivedValue = null;

  attractive.activate({
    addActions: {
      ...allBuiltinActions,
      oldStyle: (element, { value }) => {
        receivedValue = value;
      }
    },
    addDirectives: builtinDirectives
  });

  document.body.innerHTML = `
    <button id="btn" @action="oldStyle#hello">Click</button>
  `;

  await vi.runAllTimersAsync();

  document.getElementById("btn").click();

  await vi.runAllTimersAsync();

  expect(receivedValue).toBe("hello");
});
