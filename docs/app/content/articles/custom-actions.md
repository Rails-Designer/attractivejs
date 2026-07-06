---
title: Custom actions
description: Register your own actions and modifiers
category: advanced
position: 1
---

The same interface used by built-in actions is available to you. Register custom actions and modifiers.


## addAction

`addAction(name, action)`. The name is what you use in `on=""`, the action receives `(element, context)`:

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
<button on="sharePage" data-share-title="Check this out!">Share</button>
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
    // triggeredBy: the modifier that triggered this action, or null
    // dispatchEvent(name, detail): fires a CustomEvent on the element
  }
);
```

You can also batch register multiple actions at once with `addActions({ sharePage, myAction })`.


## Custom modifiers

```js
attractive.addModifier("onceTurboLoaded", (element, trigger) => {
  // Setup modifier: fires once when Turbo loads
  document.addEventListener("turbo:load", trigger, { once: true });
});

attractive.addModifier("whenSmallScreen", ({ event, element }) => {
  // Gate modifier: only allow on small screens
  return window.matchMedia("(max-width: 768px)").matches;
});
```

```html
<button on="toggleClass#active:onceTurboLoaded">Toggle</button>
<button on="removeClass#hidden:whenSmallScreen">Delete</button>
```
