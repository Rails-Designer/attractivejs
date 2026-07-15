---
title: Custom actions
description: Register your own actions, triggers and gates
category: advanced
position: 1
---

The same interface used by built-in actions is available to you. Register custom actions, triggers and gates via the `addActions` and `addDirectives` options on `activate()`.


## Add actions

Pass actions as an object to `addActions`. The key is the action name used in `@action=""`, the value is a function receiving `(element, context)`:

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

Attractive.activate({
  addActions: { sharePage }
});
```

```html
<button @action="sharePage" data-share-title="Check this out!">Share</button>
```

The action function receives the element and a context object:

```js
(element, { value, target, targets, event, dataset, actionName, triggeredBy }) => {
  // value: the string after # (e.g. "active" from toggleClass#active)
  // target: single target element by ID
  // targets: multiple target elements by CSS selector
  // event: the triggering event
  // dataset: element.dataset
  // actionName: the registered action name
  // triggeredBy: the trigger/gate that initiated this action or null
}
```

Multiple actions at once:

```js
Attractive.activate({
  addActions: { sharePage, myAction }
});
```


## Add directives (triggers and gates)

Pass triggers and gates as an object to `addDirectives`. They are registered together, the distinction is purely semantic:

- A **trigger** runs the action. The function receives `(element, run)`. Call `run()` to execute the action.
- A **gate** evaluates a condition. Return `false` to block the action.

```js
import Attractive from "attractivejs";

Attractive.activate({
  addDirectives: {
    onceTurboLoaded: (element, run) => {
      document.addEventListener("turbo:load", run, { once: true });
    },

    whenSmallScreen: ({ event, element }) => {
      return window.matchMedia("(max-width: 768px)").matches;
    },

    whenLargeScreen: ({ event, element }) => {
      return window.matchMedia("(min-width: 769px)").matches;
    }
  }
});
```

```html
<button @action="toggleClass#active:onceTurboLoaded">Toggle</button>
<button @action="removeClass#hidden:whenSmallScreen">Delete</button>
```
