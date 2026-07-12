---
title: Installation
description: Install Attractive.js via pnpm, npm or your favorite package manager.
category: get-started
position: 3
---

Install Attractive.js via pnpm or your package manager of choice.


## pnpm

```bash
pnpm add attractivejs
```


## npm

```bash
npm install attractivejs
```

Then import it into your JavaScript entrypoint and activate it.
```js
import Attractive from "attractivejs";

Attractive.activate();
```


## CDN

```html
<script type="module">
  import Attractive from "//unpkg.com/attractivejs@latest/dist/attractive.min.js";

  Attractive.activate();
</script>
```


By default, Attractive observes the entire `document`. Pass a specific element to scope it:
```js
Attractive.activate({ on: document.getElementById("sidebar") });
```

Enable debug logging:
```js
Attractive.activate({ debug: true });
```


## Select which actions to enable

```js
Attractive.activate().withActions(["class", "attribute"]);
```

Only the `class` and `attribute` actions will be available. [Read also about core](/docs/core-build/) if you want to tree-shakeable actions.
