# Addons

Addons extend Attractive instances with event modifiers, directives and behaviors. Registered per-instance via `extendWith`:

```js
import Attractive from "attractivejs";
import { keyboard } from "attractivejs/keyboard";

Attractive.activate({ extendWith: [keyboard] });
```

## Available addons

| Addon    | Import                  | Description                                                              |
| -------- | ----------------------- | ------------------------------------------------------------------------ |
| keyboard | `attractivejs/keyboard` | Key-filter dot modifiers (.enter, .escape…) and global @hotkey shortcuts |
| reactive | `attractivejs/reactive` | Reactive key-value store with `@text` DOM subscriptions                  |

## Writing an addon

An addon is a function receiving `{ instance, registry }`:

```js
export function myAddon({ instance, registry }) {
  registry.addEventModifier("custom", (event, element) => {
    return event.key === "CustomKey";
  });
}
```

### What addons can do

- `registry.addEventModifier(name, handler)`; register a dot modifier (`.custom`) for event directives
- `instance.onElementAdded(callback)` / `instance.onElementRemoved(callback)`; observe DOM element lifecycle
- `instance.addEventListener(type, handler)`; register global event listeners on the instance scope
- `instance.addAction(name, action)`; register a custom action
