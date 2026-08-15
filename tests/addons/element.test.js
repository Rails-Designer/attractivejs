import { test, expect, beforeEach, vi } from "vitest";
import AttractiveElement from "../../src/element.js";

let connectCount = 0;

class Counter extends AttractiveElement {
  connect() {
    connectCount += 1;
    this.count = 0;
  }

  increment() {
    this.count += 1;
  }
}

customElements.define("ui-counter", Counter);

class TargetTester extends AttractiveElement {
  reveal() {
    this.target("panel").hidden = false;
  }
}

customElements.define("ui-target-tester", TargetTester);

class StatusPanel extends AttractiveElement {
  connect() {
    this.connections = 0;
  }

  statusTargetConnected(element) {
    element.textContent = "Connected";
    this.connections += 1;
  }
}

customElements.define("ui-status-panel", StatusPanel);

class ToggleTester extends AttractiveElement {}

customElements.define("ui-toggle-tester", ToggleTester);

beforeEach(() => {
  document.body.innerHTML = "";
  connectCount = 0;
});

test("works standalone: HTML actions call component methods", () => {
  document.body.innerHTML = `
    <ui-counter>
      <button @click="increment">+</button>
    </ui-counter>
  `;

  document.querySelector("button").click();
  expect(document.querySelector("ui-counter").count).toBe(1);
});

test("connect and disconnect run on lifecycle", () => {
  const el = document.createElement("ui-counter");
  document.body.appendChild(el);
  expect(connectCount).toBe(1);

  el.remove();
  expect(connectCount).toBe(1);

  document.body.appendChild(el);
  expect(connectCount).toBe(2);
});

test("target() resolves within the component when ids repeat", () => {
  document.body.innerHTML = `
    <ui-target-tester>
      <button @click="reveal">One</button>
      <div id="panel" hidden></div>
    </ui-target-tester>
    <ui-target-tester>
      <button @click="reveal">Two</button>
      <div id="panel" hidden></div>
    </ui-target-tester>
  `;

  const components = document.querySelectorAll("ui-target-tester");
  const buttons = document.querySelectorAll("button");

  buttons[0].click();
  expect(components[0].querySelector('[id="panel"]').hidden).toBe(false);
  expect(components[1].querySelector('[id="panel"]').hidden).toBe(true);

  buttons[1].click();
  expect(components[1].querySelector('[id="panel"]').hidden).toBe(false);
});

test("@target resolves within the component, not the document", () => {
  document.body.innerHTML = `
    <ui-toggle-tester>
      <button @action="toggleClass#active" @target="panel">A</button>
      <div id="panel"></div>
    </ui-toggle-tester>
    <ui-toggle-tester>
      <button @action="toggleClass#active" @target="panel">B</button>
      <div id="panel"></div>
    </ui-toggle-tester>
  `;

  document.querySelectorAll("button")[0].click();

  const panels = document.querySelectorAll("ui-toggle-tester #panel");
  expect(panels[0].classList.contains("active")).toBe(true);
  expect(panels[1].classList.contains("active")).toBe(false);
});

test("*TargetConnected fires for a target present at connect", () => {
  document.body.innerHTML = `
    <ui-status-panel>
      <div id="status"></div>
    </ui-status-panel>
  `;

  const el = document.querySelector("ui-status-panel");
  expect(el.connections).toBe(1);
  expect(el.querySelector("#status").textContent).toBe("Connected");
});

test("*TargetConnected fires when the target is added later", async () => {
  document.body.innerHTML = `<ui-status-panel></ui-status-panel>`;

  const el = document.querySelector("ui-status-panel");
  expect(el.connections).toBe(0);

  el.insertAdjacentHTML("beforeend", `<div id="status"></div>`);

  await vi.waitFor(() => expect(el.connections).toBe(1));
  expect(el.querySelector("#status").textContent).toBe("Connected");
});

test("targets() and elements() return arrays", () => {
  document.body.innerHTML = `
    <ui-counter><span data-tag></span><span data-tag></span></ui-counter>
    <form id="form"></form>
  `;

  const el = document.querySelector("ui-counter");
  expect(el.element("#form")).toBe(document.getElementById("form"));
  expect(el.targets("[data-tag]")).toEqual([
    ...el.querySelectorAll("[data-tag]")
  ]);
  expect(el.elements("[data-tag]")).toEqual([
    ...document.querySelectorAll("[data-tag]")
  ]);
});
