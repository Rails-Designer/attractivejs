---
title: Reactive
description: "Reactive key-value store with DOM bindings: set, get, auto-update text content and store-driven action triggers"
category: extensions
position: 2
---

Reactive adds a shared JSON store with `@text` DOM bindings, the `setStore` action and the `inStore` trigger that drives value-aware actions (`setClass`, `setAttribute`) from store state.


## Usage

```js
import Attractive from "attractivejs";
import { reactive } from "attractivejs/reactive";

Attractive.activate({ extendWith: [reactive] });
```


## Store API

The store is a JSON tree shared by all instances. Write from JavaScript via `store.set()` or from HTML via `setStore`, every subscriber reacts regardless of the source. Dot-paths create nested objects automatically.

```js
store.set("user.name", "Cameron");

store.get("user.name");  // => "Cameron"
store.has("user.name");  // => true

store.clear();  // empties the tree, notifies all subscribers
```

When the `js` action is registered, the store is available in `js:` expressions through the global `$store` (see [Inline JS](/docs/inline/)).


## Hydration

Seed the store from the server by dropping a JSON blob in the page. It is read automatically at activation.

```html
<script type="application/json" data-store>
  { "user": { "online": true }, "unread": 2 }
</script>
```


## `@text` bindings

Bind an element's `textContent` to a store value. It updates automatically whenever the value changes and renders an empty string for `null` or `undefined`.

```html
<p @text="greeting"></p>
```


## `setStore` action

Write the element's own `value` to the store:

```html
<input @input="setStore#search" />
```

Set a key to `true` with no value:

```html
<button @click="setStore#active">Activate</button>
```

Coerce literals with `key=value`. `true`, `false`, `null` and numbers are parsed; everything else stays a string:

```html
<button @click="setStore#flag=true">Enable</button>
<button @click="setStore#unread=0">Reset</button>
```

Server replies merge a value through `data` (used by [Attract](/docs/attract/) responses):

```json
{ "action": "setStore#unread", "data": 0 }
```


## `inStore` trigger

React to store changes by firing an action whenever the value changes. The key is read from `data-store`, and the current value is applied when the element is first bound, so elements reflect hydrated state on load.

Pair it with the store-aware actions `setClass` and `setAttribute`: when the element carries `data-store`, those actions read the store value and toggle by its truthiness instead of using a fixed value.

```html
<span
  @action="setClass#online:inStore"
  data-store="user.online"
  class="dot"
>
  ●
</span>

<span
  @action="setAttribute#data-online:inStore"
  data-store="user.online"
>
  online
</span>
```

When `user.online` is truthy the dot gets the `online` class and the pill gets the `data-online` attribute; when it flips to falsy both are removed. Updating the store (from a button, an input or a server reply) updates every bound element.
