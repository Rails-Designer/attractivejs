import { test, expect, beforeEach, afterEach } from "vitest";
import Attractive from "../../src/index.js";
import AttractiveElement from "../../src/element.js";
import builtinActions from "../../src/actions/index.js";
import {
  builtinGates,
  builtinTriggers
} from "../../src/core/builtin_directives.js";

let attractive;
let count;
let created;

const baseOptions = {
  addActions: { ...builtinActions, count: () => (count += 1) },
  addGates: builtinGates,
  addTriggers: builtinTriggers
};

class CounterElement extends AttractiveElement {
  count() {
    count += 1;
  }
}

customElements.define("ui-scope-counter", CounterElement);

beforeEach(() => {
  document.body.innerHTML = "";
  count = 0;

  attractive = new Attractive();
  created = [attractive];
});

afterEach(() => {
  created.forEach((instance) => instance.deactivate());
});

function activateOn(id) {
  const instance = new Attractive();
  created.push(instance);
  instance.activate({ on: document.getElementById(id), ...baseOptions });

  return instance;
}

test("action inside a nested scoped activation fires once", () => {
  document.body.innerHTML = `<div id="outer"><button @action="count">Count</button></div>`;

  attractive.activate(baseOptions);
  const nested = activateOn("outer");

  document.querySelector("button").click();
  expect(count).toBe(1);

  nested.deactivate();

  document.querySelector("button").click();
  expect(count).toBe(2);
});

test("scoped activation registered after the outer scan still prevents double-fire", () => {
  document.body.innerHTML = `<div id="outer"><button @action="count">Count</button></div>`;

  attractive.activate(baseOptions);
  activateOn("outer");

  document.querySelector("button").click();
  expect(count).toBe(1);

  created[1].deactivate();

  document.querySelector("button").click();
  expect(count).toBe(2);
});

test("nested scoped activation does not double-process, even nested in another", () => {
  document.body.innerHTML = `
    <div id="outer"><div id="inner"><button @action="count">Count</button></div></div>
  `;

  attractive.activate(baseOptions);
  activateOn("outer");
  activateOn("inner");

  document.querySelector("button").click();
  expect(count).toBe(1);
});

test("a scoped activation ignores elements outside its scope", () => {
  document.body.innerHTML = `
    <div id="scope"><button @action="count">In</button></div>
    <button id="outside" @action="count">Out</button>
  `;

  activateOn("scope");

  document.getElementById("outside").click();
  expect(count).toBe(0);
});

test("window-targeted actions inside a nested scope fire once", () => {
  document.body.innerHTML = `<div id="outer"><button @click.window="count">Count</button></div>`;

  attractive.activate(baseOptions);
  activateOn("outer");

  window.dispatchEvent(new MouseEvent("click", { bubbles: true }));
  expect(count).toBe(1);
});

test("a scoped activation resolves @target within its own scope", () => {
  document.body.innerHTML = `
    <div id="first">
      <button @action="addClass#active" @target="panel">First</button>
      <div id="panel"></div>
    </div>
    <div id="second">
      <button @action="addClass#active" @target="panel">Second</button>
      <div id="panel"></div>
    </div>
  `;

  activateOn("first");
  activateOn("second");

  document.querySelector("#first button").click();

  const firstPanel = document.querySelector("#first [id='panel']");
  const secondPanel = document.querySelector("#second [id='panel']");

  expect(firstPanel.classList.contains("active")).toBe(true);
  expect(secondPanel.classList.contains("active")).toBe(false);
});

test("document-wide activation does not double-process a component", () => {
  document.body.innerHTML = `
    <ui-scope-counter>
      <button @action="count">Count</button>
    </ui-scope-counter>
  `;

  attractive.activate(baseOptions);

  document.querySelector("button").click();
  expect(count).toBe(1);
});
