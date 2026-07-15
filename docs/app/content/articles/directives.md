---
title: Triggers and gates
description: Control when and how actions run with triggers and gates
category: basics
position: 2
---

Triggers and gates control when and how actions run. They are appended to the action value with a colon.
```html
<button @action="addClass#visible:mounted">Appears on load</button>
<button @action="toggleClass#open:once">Toggle once</button>
<form @action="toggleClass#submitted:preventDefault">Submit</form>
```


## Triggers

Triggers run the action when a condition is met, rather than on a user event.

| Trigger       | Description                                                              |
| ------------- | ------------------------------------------------------------------------ |
| `:mounted`    | Runs immediately when the element is added to the DOM                   |
| `:now`        | Alias for `:mounted`                                                     |
| `:whenVisible`| Fires once when the element scrolls into view (via IntersectionObserver) |
| `:whenInView` | Alias for `:whenVisible`                                                 |

```html
<div @action="addClass#fade-in:mounted">Appears immediately</div>
<img @action="addClass#loaded:whenVisible" data-src="/image.jpg" loading="lazy" />
```


## Gates

Gates evaluate a condition before allowing the action to run. Returns `false` to block the action.

| Gate               | Description                                                |
| ------------------ | ---------------------------------------------------------- |
| `:once`            | Prevents the action from running more than once per element |
| `:preventDefault`  | Calls `event.preventDefault()`                             |
| `:stopPropagation` | Calls `event.stopPropagation()`                            |
| `:whenOutside`     | Only fires when the click target is outside the element    |

```html
<button @action="toggleClass#clicked:once">Click once</button>
<button @action="removeClass#loading:preventDefault">Save</button>

<div @action="toggleClass#open" @target="menu">
  <button>Menu</button>
</div>

<div @action="removeClass#open:whenOutside" @target="menu">…</div>
```

Multiple triggers and gates can be chained:
```html
<div @action="addClass#visible:mounted:once">Shows once</div>
<button @action="copy:once:preventDefault" @target="source">Copy</button>
```
