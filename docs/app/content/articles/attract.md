---
title: Attract
description: "Attract makes optimistic UI easy to add to your app's UI. Define a template, attach the attributes and you are ready."
category: extensions
position: 3
---

The `@attract` attribute intercepts a `<form>` submit and sends a fetch request instead. A cached `<template>` can be used to render an optimistic preview while the server processes the request.

```js
import Attractive from "attractivejs";
import { attract } from "attractivejs/attract";

Attractive.activate({ extendWith: [attract] });
```


## `@attract` attribute

`@attract` on a `<form>` (or a container that propagates to child forms) intercepts submit and issues a fetch. The form's `action` and `method` are used as-is.
```html
<form action="/messages" method="post" @attract>
  <input name="author" />
  <input name="body" />

  <button>Submit</button>
</form>
```

On a container, `@attract` propagates to child `<form>` elements:
```html
<div @attract>
  <form action="/messages" method="post">
    <input name="body" />

    <button>Submit</button>
  </form>
</div>
```

| Data attribute | Purpose |
|----------------|---------|
| `data-attract-template` | ID of `<template>` to clone for optimistic render |
| `data-attract-target` | Target element ID or CSS selector |
| `data-attract-position` | Insertion position: `append` (default), `prepend`, `replace`, `before`, `after` |

Feedback states on the form element:

| State | Attribute |
|-------|-----------|
| Busy | `data-attract-busy` |
| Success | `data-attract-success="true"` |
| Error | `data-attract-error="true"` |


## Mapping response data to elements

Place `attract-field="key"` on elements inside an attract `<template>`. When the template renders with JSON data, the matching key's value is applied to the element based on its type:

| Element | Behavior |
|---|---|
| `<input type="checkbox">` / `<input type="radio">` | `element.checked = !!value` |
| `<input>` / `<textarea>` / `<select>` | `element.value = value` |
| `<option>` | `element.selected = !!value` |
| Everything else (div, span, h1, p, etc.) | `element.textContent = value` |

```html
<template id="message">
  <div class="message">
    <strong attract-field="author"></strong>

    <p attract-field="body"></p>
  </div>
</template>
```


## JSON response format
The response is an `action` hash or an `actions` array. Each action describes a DOM operation.

`data` is an object (single item) or an array (multiple items, each rendered independently):

```json
{
  "action": "prepend",
  "target": "messages",
  "template": "message",
  "data": { "author": "Cameron", "body": "Hello" }
  // "data": [
  //   { "author": "Cameron", "body": "Hello" },
  //   { "author": "Kendall", "body": "Hi" }
  // ]
}
```

Actions without `data` work too. The `target` field specifies the element:
```json
{ "action": "remove", "target": "spinner" }
{ "action": "setAttribute#id=42", "target": "new-message" }
```

Multiple actions in one response:
```json
{
  "actions": [
    { "action": "replace", "target": "new-message", "template": "message", "data": { "author": "Cameron", "body": "Hello!" } },
    { "action": "remove", "target": "spinner" },
    { "action": "setAttribute#id=42", "target": "new-message" }
  ]
}
```

Actions execute sequentially in the order they appear.

Any registered action (built-in, custom or from an addon) can be used.

For validation errors, the server returns an `errors` object. Each key maps to a form field by `name` using the native [Validity API](https://developer.mozilla.org/en-US/docs/Web/API/ValidityState):

```json
{
  "errors": { "body": "Cannot be empty" }
}
```


## Attract request headers

Every attract request sends two headers:
- `Attract: true` — identifies the request as coming from an attract client
- `Accept: application/vnd.attract+json` — signals the expected JSON response format

The client validates the response `Content-Type` contains `json` before processing. Non-JSON responses are treated as errors.

The headers are sent on three request paths:
- **Form submissions** via `@attract`
- **Generic request actions** (`post`, `patch`, `put`)
- **GET request action** (`get`)


## Attract added actions

These actions work from both `@action="…"` in HTML and from JSON responses:

| Action | What it does |
|--------|-------------|
| `append` | Clone template, append to target |
| `prepend` | Clone template, prepend to target |
| `replace` | Clone template, replace target element |
| `before` | Clone template, insert before target |
| `after` | Clone template, insert after target |
| `remove` | Remove target element(s) |

The actions can be imported individually and used without the full addon. Register the ones you need via `addActions`:
```js
import Attractive from "attractivejs";
import { append, remove } from "attractivejs/attract/actions";

Attractive.activate({ addActions: { append, remove } });
```
Or register all of them via the default export:
```js
import actions from "attractivejs/attract/actions";

Attractive.activate({ addActions: actions });
```

```html
<ul id="messages"></ul>

<button @action="append#message" @target="messages">Add</button>

<template id="message">
  <div class="message">
    <strong>Cameron</strong>

    <p>Hello</p>
  </div>
</template>
```
