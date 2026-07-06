---
title: Triggers and gates
description: Control when and how actions fire with triggers and gates
category: basics
position: 2
---

Triggers and gates control when and how actions fire. They are appended to the action value with a colon.
```html
<button on="addClass#visible:mounted">Appears on load</button>
<button on="toggleClass#open:once">Toggle once</button>
<button on="get#/search:preventDefault">Search</button>
```


## Triggers

Triggers fire the action when a condition is met, rather than on a user event.

| Trigger       | Description                                                              |
| ------------- | ------------------------------------------------------------------------ |
| `:mounted`    | Fires immediately when the element is added to the DOM                   |
| `:now`        | Alias for `:mounted`                                                     |
| `:whenVisible`| Fires once when the element scrolls into view (via IntersectionObserver) |
| `:whenInView` | Alias for `:whenVisible`                                                 |

```html
<div on="addClass#fade-in:mounted">Appears immediately</div>
<img on="addClass#loaded:whenVisible" data-src="/image.jpg" loading="lazy" />
```


## Gates

Gates evaluate a condition before allowing the action to fire. Returns `false` to block the action.

| Gate               | Description                                                |
| ------------------ | ---------------------------------------------------------- |
| `:once`            | Prevents the action from firing more than once per element |
| `:preventDefault`  | Calls `event.preventDefault()`                             |
| `:stopPropagation` | Calls `event.stopPropagation()`                            |
| `:whenOutside`     | Only fires when the click target is outside the element    |

```html
<button on="toggleClass#clicked:once">Click once</button>
<form on="get#/search:preventDefault">…</form>

<div on="toggleClass#open" on-target="menu">
  <button>Menu</button>
</div>

<div on="removeClass#open:whenOutside" on-target="menu">…</div>
```

Multiple triggers and gates can be chained:
```html
<div on="addClass#visible:mounted:once">Shows once</div>
<button on="copy:once:preventDefault">Copy once</button>
```
