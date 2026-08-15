---
title: Reactive
description: "Reactive key-value store with DOM bindings: set, get, auto-update text content and store-driven action triggers"
category: extensions
position: 2
---

Reactive adds a shared key-value store with `@text` DOM bindings, `setStore` action and `whenTrue`/`whenFalse` triggers.


## Usage

```js
import Attractive from "attractivejs";
import { reactive, store } from "attractivejs/reactive";

Attractive.activate({ extendWith: [reactive] });
```


## Store API

The store is a singleton shared by all instances. Write from JavaScript via `store.set()` or from HTML via `setStore`, all subscribers react regardless of source.
```js
store.set("name", { with: "Cameron" });

store.get("name"); // => "Alice"
```

When the `js` action is registered, it can read and write the store from HTML via the global `$store`:
```html
<input @input="js:$store.set('name', { with: this.value })" data-debounce="300" />
```


## `@text` bindings

```html
<p @text="greeting"></p>
```

The element's `textContent` updates automatically whenever the store value changes. Shows empty string for `null` or `undefined`.


## `setStore` action

Write the element's `value` to the store:
```html
<input @input="setStore#search" />
```

Sets the store key to `true`:
```html
<button @click="setStore#active">Activate</button>
```


## `:whenTrue` / `:whenFalse` triggers

React to store changes by firing actions when a value enters a specific state. Both read the store key from `data-store`.

Truthy values are anything not `false`, `null`, `undefined`, `0`, `""` or `NaN`.


### `:whenTrue`

Fires the action when the store value is truthy:
```html
<div @action="addClass#visible:whenTrue" data-store="loaded"></div>
```


### `:whenFalse`

Fires the action when the store value is falsy:
```html
<div @action="removeClass#visible:whenFalse" data-store="loaded"></div>
```


### Paired pattern

The common use case is pairing both to handle truthy/falsy transitions:
```html
<div
  @action="addAttribute#open:whenTrue removeAttribute#open:whenFalse"
  data-store="open"
></div>
```

On `store.set("open", { with: true })` the attribute is added. On `store.set("open", { with: false })` it is removed.
