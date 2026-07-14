---
title: Upgrade guide
description: Migrate from v0.x to the 1.0.0 release
category: get-started
position: 4
---

Changes you need to make when upgrading to v1.0.0.


## Attribute changes

The attribute syntax changed from `data-action` / `data-target` to `@action` / `@target`.

| v0.x (deprecated)                  | v1.0.0                    |
| ---------------------------------- | ------------------------- |
| `data-action="toggleClass#active"` | `@action="toggleClass#active"` |
| `data-target="panel"`              | `@target="panel"`         |
| `data-targets=".items"`            | `@targets=".items"`       |

The shorthand `@=""` is equivalent to `@action=""`.


## Auto-activation

v1.0.0 supports script tag auto-activation:
```html
<script src="//unpkg.com/attractivejs" type="module" activate></script>
```

The `activate` attribute on the script tag replaces the need for manual `Attractive.activate()` calls in simple setups.


## Scoped instances

```js
const attractive = new Attractive();
attractive.activate({ on: document.getElementById("sidebar") });
```

Actions are isolated to their container element.


## Event type attributes

Event types are now set via the attribute name instead of the `->` syntax:

| v0.x (deprecated)                              | v1.0.0                              |
| ---------------------------------------------- | ----------------------------------- |
| `"mouseenter->addClass#hovered"`       | `@mouseenter="addClass#hovered"`    |
| `"window@click->removeClass#open"`     | `@click.window="removeClass#open"`  |
| `"change->addClass#dirty"`             | `@change="addClass#dirty"`          |

The `->` syntax and embedded event types are removed. The value now only contains the action, optional value and directives.

The `.window` and `.document` modifiers on the attribute name replace the old `window@event->` pattern.

