---
title: Core build
description: Use the core engine (~10 kB) and compose only the actions you need
category: advanced
position: 3
---

The full Attractive.js build includes all built-in actions at ~20 kB (6.6 kB gzipped). The core build strips out all actions, only the engine at ~10 kB (~3.5 kB gzipped).
```js
import Attractive from "attractivejs/core";
```

Import only the actions you need:
```js
import { toggleClass } from "attractivejs/actions/class";
import { copy } from "attractivejs/actions/clipboard";
```

Register them individually with `addAction(name, action)`. The name is what you use in `on=""`, the action is the imported function:
```js
const attractive = new Attractive();

attractive.addAction("toggleClass", toggleClass);
attractive.addAction("copy", copy);
// or batch them: addActions({ toggleClass: toggleClass, copy: copy })
// or shorthand: addActions({ toggleClass, copy })

attractive.activate();
```
```

Custom actions work the same way. The action is a function you define:
```js
// const analytics = (element, context) => { … };

attractive.addAction("analytics", analytics);
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
