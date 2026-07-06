---
title: Installation
description: Install Attractive.js via pnpm, npm or your favorite package manager.
category: get-started
position: 3
---

Install Attractive.js via npm or your package manager of choice.


## pnpm

```bash
pnpm add attractivejs
```


## npm

```bash
npm install attractivejs
```


## yarn

```bash
yarn add attractivejs
```


Then import it into your JavaScript entrypoint and activate it. 🧲
```js
import Attractive from "attractivejs";

const attractive = Attractive.activate();
```

By default, Attractive observes the entire `document`. Pass a specific element to scope it:
```js
const attractive = Attractive.activate({
  on: document.getElementById("sidebar")
});
```

Enable debug logging:
```js
const attractive = Attractive.activate({ debug: true });
```


## Select which actions to enable

```js
Attractive.activate().withActions(["class", "attribute"]);
```

Only the `class` and `attribute` actions will be available.
