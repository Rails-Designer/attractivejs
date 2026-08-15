---
title: Attractive Element
description: A base class for custom elements that scopes Attractive to the component. Actions, targets and lifecycle without the boilerplate.
category: extensions
position: 5
---

`AttractiveElement` is a base class for custom elements. It scopes Attractive to the component, so `@click`, `@target`, gates and triggers work inside the component without a `connectedCallback`, `querySelector` or manual teardown.

```js
import { AttractiveElement } from "attractivejs/element";
```


## A simple example: tabs

Actions in HTML call component methods directly. The component manages its own state and resolves targets within its own subtree.

```html
<ui-tabs>
  <nav>
    <button @click="select" data-panel="details">Details</button>
    <button @click="select" data-panel="settings">Settings</button>
  </nav>

  <div id="details" class="panel">…</div>
  <div id="settings" class="panel" hidden>…</div>
</ui-tabs>
```

```js
class Tabs extends AttractiveElement {
  connect() {
    this.#show("details");
  }

  select(element, { dataset }) {
    this.#show(dataset.panel);
  }

  // private

  #show(name) {
    this.targets(".panel").forEach((panel) => (panel.hidden = true));

    this.target(name).hidden = false;
  }
}

customElements.define("ui-tabs", Tabs);
```

The action name in the attribute resolves to a method on the class, called with the element and its context (so `select` receives the clicked button's `dataset`). Private methods stay out of HTML.

What the class handles for you:

| Boilerplate                   | Replaced by              |
| ----------------------------- | ------------------------ |
| `connectedCallback`           | `connect()`              |
| `disconnectedCallback`        | `disconnect()`           |
| `new Attractive()` + `activate({ on: this })` | automatic |
| `deactivate()`                | automatic                |
| `this.querySelector("#menu")` | `this.target("menu")`    |
| `document.querySelector(…)` | `this.element(…)`      |


## Lifecycle

`connect()` runs once the component's scope is active; `disconnect()` runs before it is torn down.

```js
class Counter extends AttractiveElement {
  connect() {
    this.count = 0;
  }

  increment() {
    this.target("count").textContent = ++this.count;
  }
}
```


## Scoped targets

`this.target(id)` and `this.targets(selector)` query within the component. `target()` takes a bare id, the same convention as `@target`.

```html
<ui-counter>
  <button @click="increment">+</button>

  <output id="count">0</output>
</ui-counter>
```

Each component resolves its own `#count`, even when the same id appears on the page twice.


## Any element on the page

`this.element(selector)` and `this.elements(selector)` reach the rest of the document. This is useful for calling methods on other components.

```js
class Form extends AttractiveElement {
  submit() {
    this.element("ui-button").activate();
  }
}
```


## Reactive targets

A method named `{id}TargetConnected()` runs when an element with that id enters the component, and `{id}TargetDisconnected()` when it leaves. This catches targets added after the component connects.

```js
class Panel extends AttractiveElement {
  detailsTargetConnected(element) {
    element.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 200 });
  }
}
```


## Alongside a document-wide activation

Components work when a global `Attractive.activate()` is also running. The component manages its own subtree and the page-wide activation leaves it alone, so actions never fire twice.
