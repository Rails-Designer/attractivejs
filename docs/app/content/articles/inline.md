---
title: Inline JavaScript (js:)
description: Write one liner JavaScript expressions directly in your HTML attributes
category: advanced
position: 4
---

A `js:` value prefix on event attributes evaluates a JavaScript expression. For one liners too small for a custom action and not covered by built in actions.


## Syntax

```html
<button @click="js:this.textContent = $store.get('count')" @target="counter" data-debounce="200">
  Update
</button>
```

The `js:` prefix works on any event attribute like `@click`, `@mouseenter`, `@input`, `@action` and so on.


## What is available

| Name | Value |
|------|-------|
| `this` | The element |
| `event` | The DOM event (or null if triggered by a directive like `:mounted`) |
| `target` | The value of `@target` attribute on the element |
| `targets` | The value of `@targets` attribute on the element |

When the reactive addon is loaded, `$store` is also available:
```html
<input @input="js:$store.set('name', { with: this.value })" data-debounce="300" />

<button @click="js:$store.set('count', { with: ($store.get('count') || 0) + 1 })">+1</button>
```


## Pipeline integration

A `js:` expression goes through the full action pipeline. It is not a bypass. This means:

- `@target` and `@targets` are available as `target` and `targets` in the expression
- `data-debounce` on the element works
- Event modifiers like `@click.window` and `@keydown.enter` work
- before and after hooks run
- Debug logs show the action name and timing
- Errors are caught, logged and routed to `onError`
- `return false` prevents default


## What does not work

- **No combining with other actions in the same attribute**; `@click="js:foo toggleClass#active"` will not work. Use separate attributes.
- **No directives**; `:mounted`, `:debounce`, `:once` and similar are not supported inside `js:` expressions.
- **Single expression only**; use the comma operator for multiple statements. For more complex logic, register a custom action.


## Import

The `js` action is not included in the default bundle. Add it explicitly:
```js
import { js } from "attractivejs/actions/inline";

Attractive.activate({
  addActions: { js }
});
```

The reactive addon also registers `js` with `$store` access. When using the reactive addon, you do not need to import `js` separately:
```js
import { reactive } from "attractivejs/reactive";

Attractive.activate({
  extendWith: [reactive]
});
```

## CSP note

The `js:` action uses `new Function()` internally. This requires `Content-Security-Policy: script-src 'unsafe-eval'`. If your CSP does not include `unsafe eval`, importing `js` will fail at runtime.

Standard HTML attribute quoting applies. Be mindful of quote nesting inside expressions.
