import { test, expect, beforeEach, vi } from "vitest";
import Attractive from "../../src/index.js";

let attractive;

beforeEach(() => {
  if (attractive) attractive.deactivate();

  document.body.innerHTML = "";

  attractive = new Attractive();
  attractive.activate();
});

test("fires for an element already in the scope at registration", () => {
  document.body.innerHTML = `<div id="status"></div>`;

  const spy = vi.fn();
  attractive.onTargetConnected("status", spy);

  expect(spy).toHaveBeenCalledTimes(1);
  expect(spy).toHaveBeenCalledWith(document.getElementById("status"));
});

test("fires when a matching element is added later", async () => {
  const spy = vi.fn();
  attractive.onTargetConnected("status", spy);

  document.body.innerHTML = `<div id="status"></div>`;

  await vi.waitFor(() => expect(spy).toHaveBeenCalledTimes(1));
});

test("fires when the matching element is removed", async () => {
  document.body.innerHTML = `<div id="status"></div>`;

  const spy = vi.fn();
  attractive.onTargetDisconnected("status", spy);

  document.body.innerHTML = "";

  await vi.waitFor(() => expect(spy).toHaveBeenCalledTimes(1));
});

test("does not fire for other ids", async () => {
  const spy = vi.fn();
  attractive.onTargetConnected("status", spy);

  document.body.innerHTML = `<div id="other"></div>`;
  await Promise.resolve();

  expect(spy).not.toHaveBeenCalled();
});

test("fires during the initial scan when registered before activation", () => {
  document.body.innerHTML = `<div id="status"></div>`;

  const spy = vi.fn();
  const fresh = new Attractive();
  fresh.onTargetConnected("status", spy);
  fresh.activate();

  expect(spy).toHaveBeenCalledTimes(1);
});
