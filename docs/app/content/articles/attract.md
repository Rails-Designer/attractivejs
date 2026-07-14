---
title: Attract
description: "Form submissions via cached templates and JSON responses: optimistic render, server enrichment, replace cycle"
category: extensions
position: 3
---

The `@attract` attribute intercepts a `<form>` submit and sends a fetch request instead. A cached `<template>` can be used to render an optimistic preview while the server processes the request.

Requires the [reactive](/docs/reactive/) addon.

```js
import Attractive from "attractivejs";
import { reactive } from "attractivejs/reactive";
import { attract } from "attractivejs/attract";

Attractive.activate({ extendWith: [reactive, attract] });
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


## JSON response format
The response is an `action` hash or an `actions` array. Each action describes a DOM operation.

`data` is an object (single item) or an array (multiple items, each rendered independently):

```json
{
  "action": "append",
  "target": "messages",
  "template": "message-card",
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
{ "action": "setAttribute#id=msg-42", "target": "new-message" }
```

Multiple actions in one response:
```json
{
  "actions": [
    { "action": "replace", "target": "new-message", "template": "message-card", "data": { "author": "Cameron", "body": "Hello!" } },
    { "action": "remove", "target": "spinner" },
    { "action": "setAttribute#id=msg-42", "target": "new-message" }
  ]
}
```

Actions execute sequentially in the order they appear.

Any registered action (built-in, custom or from an addon) can be used.

For validation errors, the server returns an `errors` object. Each key maps to a form field by `name` using the native [Validity API](https://developer.mozilla.org/en-US/docs/Web/API/ValidityState):

```json
{
  "errors": { "body": "can't be blank" }
}
```


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

```html
<button @action="append#message-card" @target="list">Add</button>
```


## `@text` on cloned templates

When a template is cloned via `@attract`, `@text` is removed from the clone. Use `data-attract-preserve-text` to keep it [reactive](/docs/reactive/).

The attract-added actions also work via `@action` directly. In that case `@text` is preserved and the clone stays reactive.
