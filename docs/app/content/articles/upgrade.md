---
title: Upgrade guide
description: Migrate from v0.x to the 1.0.0 release
category: get-started
position: 4
---

Changes you need to make when upgrading to v1.0.0.


## Attribute changes

The attribute prefix changed from `data-action` to `on`.

| v0.x (deprecated)                  | v1.0.0                      |
| ---------------------------------- | ------------------------- |
| `data-action="toggleClass#active"` | `on="toggleClass#active"` |
| `data-target="panel"`              | `on-target="panel"`       |
| `data-targets=".items"`            | `on-targets=".items"`     |


## Auto-activation

v1.0.0 supports script tag auto-activation:
```html
<script src="//unpkg.com/attractivejs" type="module" activate></script>
```

The `activate` attribute on the script tag replaces the need for manual `Attractive.activate()` calls in simple setups.


## Configurable prefix

```js
Attractive.configure({ prefix: "data-on" });
```

The prefix is no longer hardcoded to `data-action`. Configure it for all instances.


## Scoped instances

```js
const attractive = new Attractive();
attractive.activate({ on: document.getElementById("sidebar") });
```

Actions are isolated to their container element.


## Custom actions and modifiers

Custom actions and modifiers via `registerAction`, `registerModifier`, and `use()`.
