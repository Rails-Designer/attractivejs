---
title: Custom actions
description: Register your own actions, triggers and gates
category: advanced
position: 1
---

The same interface used by built-in actions is available to you. Register custom actions, triggers and gates.


## addAction

`addAction(name, action)`. The name is what you use in `@action=""`, the action receives `(element, context)`:

```js
import Attractive from "attractivejs";

const sharePage = (element, { dataset }) => {
  const title = dataset.shareTitle || document.title;
  const url = dataset.shareUrl || window.location.href;

  if (navigator.share) {
    navigator.share({ title, url });
  } else {
    navigator.clipboard.writeText(url);
  }
};

const attractive = Attractive.activate();

attractive.addAction("sharePage", sharePage);
```

```html
<button @action="sharePage" data-share-title="Check this out!">Share</button>
```

The action function receives the element and a context object:
```js
attractive.addAction(
  "myAction",
  (
    element,
    { value, target, targets, event, dataset, actionName, triggeredBy, dispatchEvent }
  ) => {
    // value: the string after # (e.g. "active" from toggleClass#active)
    // target: single target element by ID
    // targets: multiple target elements by CSS selector
    // event: the triggering event
    // dataset: element.dataset
    // actionName: the registered action name
    // triggeredBy: the trigger/gate that initiated this action or null
    // dispatchEvent(name, detail): fires a CustomEvent on the element
  }
);
```

You can also batch register multiple actions at once with `addActions({ sharePage, myAction })`.


## addTrigger

Triggers fire the action when a condition is met (rather than on a user event). The function receives `(element, fire)` — call `fire()` to execute the action.

```js
attractive.addTrigger("onceTurboLoaded", (element, fire) => {
  document.addEventListener("turbo:load", fire, { once: true });
});
```

```html
<button @action="toggleClass#active:onceTurboLoaded">Toggle</button>
```

Batch register triggers with `addTriggers({ onceTurboLoaded, … })`.


## addGate

Gates evaluate a condition before allowing the action to fire. Return `false` to block the action.

```js
attractive.addGate("whenSmallScreen", ({ event, element }) => {
  return window.matchMedia("(max-width: 768px)").matches;
});
```

```html
<button @action="removeClass#hidden:whenSmallScreen">Delete</button>
```

Batch register gates with `addGates({ whenSmallScreen, … })`.
