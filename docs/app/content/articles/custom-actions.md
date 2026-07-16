---
title: Custom actions
description: Register your own actions, triggers and gates
category: advanced
position: 1
---

The same interface used by built-in actions is available to you. Register custom actions via `addActions`, triggers via `addTriggers`, and gates via `addGates` on `activate()`.


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


## Custom actions as a class

You can write custom actions as a class. A good fit if the action function grows beyond a reasonable size.

A class action is any class with a `run` method:
```js
class Reorder {
  run() {
    this.currentElement  // the element with @action
    this.options  // { value, target, targets, event, dataset, … }
  }
}
```

You register it the same way as a function action:
```js
Attractive.activate({
  addActions: { reorder: Reorder }
});
```

An optional base class is available if you want shorthand access to `value` and `dataset`, along with a `dispatchEvent` helper:
```js
import { Action } from "attractivejs";

export default class Reorder extends Action {
  run() {
    this.value  // the string after
    this.dataset  // element.dataset

    this.dispatchEvent("reorder:done", { ids: [1, 2, 3] })
  }
}
```

The base class is entirely optional. A class with a `run` method is sufficient on its own.


## Organizing actions

When you have many action files, it helps to keep each one in its own file and collect them in one place.
```bash
src/
  actions/
    share_page.js
    reorder.js
    index.js
  app.js
```

Each action file exports a single function or class as default. The barrel file (`src/actions/index.js`) collects them into one object:
```js
// src/actions/index.js
import sharePage from "./share_page.js";
import reorder from "./reorder.js";

export default { sharePage, reorder };
```

Then your application file imports the barrel and activates:
```js
// src/app.js
import Attractive from "attractivejs";
import actions from "./actions/index.js";

Attractive.activate({ addActions: actions });
```

If your setup can produce a map of paths to modules (Vite, Rolldown, Webpack, or any tool with a glob import feature), the `from` helper takes that map and converts it into the same format. The snake_case filename becomes the camelCase action name.


## Add triggers

Pass triggers as an object to `addTriggers`. A **trigger** runs the action. The function receives `(element, run)`. Call `run()` to execute the action.

```js
import Attractive from "attractivejs";

Attractive.activate({
  addTriggers: {
    onceTurboLoaded: (element, run) => {
      document.addEventListener("turbo:load", run, { once: true });
    }
  }
});
```

## Add gates

Pass gates as an object to `addGates`. A **gate** evaluates a condition. The function receives `(element, { event })`. Return `false` to block the action.

```js
import Attractive from "attractivejs";

Attractive.activate({
  addGates: {
    whenSmallScreen: (element, { event }) => {
      return window.matchMedia("(max-width: 768px)").matches;
    },

    whenLargeScreen: (element, { event }) => {
      return window.matchMedia("(min-width: 769px)").matches;
    }
  }
});
```

```html
<button @action="toggleClass#active:onceTurboLoaded">Toggle</button>
<button @action="removeClass#hidden:whenSmallScreen">Delete</button>
```
