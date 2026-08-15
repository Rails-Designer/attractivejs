---
title: Core build
description: Use the core engine kB) and compose only the actions you need
category: advanced
position: 3
---

The full Attractive.js build includes all built-in actions, you can also just use the core and compose actions as you need.
```js
import Attractive from "attractivejs/core";
```

Import only the actions you need:
```js
import { toggleClass } from "attractivejs/actions/class";
import { copy } from "attractivejs/actions/clipboard";
```

Pass them as the `addActions` option to `activate()`. The key is the action name used in `@action=""`, the value is the imported function:
```js
import Attractive from "attractivejs/core";

Attractive.activate({
  addActions: { toggleClass, copy }
});
```

Custom actions work the same way. The action is a function you define:
```js
// const analytics = (element, context) => { … };

Attractive.activate({
  addActions: { analytics }
});
```

You get a minimal build with exactly the actions your project uses.


## Available imports

| Import path                           | Contents                   |
| ------------------------------------- | -------------------------- |
| `attractivejs/core`                   | Engine only                |
| `attractivejs/actions`                | All action modules         |
| `attractivejs/actions/class`          | Class actions              |
| `attractivejs/actions/attribute`      | Attribute actions          |
| `attractivejs/actions/data-attribute` | Data attribute actions     |
| `attractivejs/actions/clipboard`      | Copy action                |
| `attractivejs/actions/confirm`        | Confirm action             |
| `attractivejs/actions/dialog`         | Dialog actions             |
| `attractivejs/actions/element`        | Element add/remove actions |
| `attractivejs/actions/focus`          | Focus action               |
| `attractivejs/actions/form`           | Form submit/reset actions  |
| `attractivejs/actions/reload`         | Reload action              |
| `attractivejs/actions/request`        | HTTP request actions       |
| `attractivejs/actions/scroll-to`      | Scroll to action           |
| `attractivejs/actions/style`          | Style actions              |
