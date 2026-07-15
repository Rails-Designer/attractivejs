---
title: Keyboard
description: Filter keydown events with dot modifiers like .enter, .escape and combo syntax ctrl+k
category: extensions
position: 1
---

Keyboard adds key-filter dot modifiers for `@keydown` and global `@hotkey` shortcuts.


## Usage

```js
import Attractive from "attractivejs";
import { keyboard } from "attractivejs/keyboard";

Attractive.activate({ extendWith: [keyboard] });
```


## @keydown vs @hotkey

| Directive    | Scope    |
| ------------ | -------- |
| `@keydown.*` | Element — must be focused |
| `@hotkey.*`  | Global — suppressed when editing form fields |


## @keydown

Dot modifiers filter which keys trigger the action. The element must be focused for `@keydown` to run:
```html
<input @keydown.enter="addClass#submitted" @target="status" />
```

Children of the focused element also trigger it, since events bubble:
```html
<form @keydown.enter="addClass#searching" @target="results">
  <input name="q" />

  <button>Search</button>
</form>
```

| Modifier      | Checks                        |
| ------------- | ----------------------------- |
| `.enter`      | `event.key === "Enter"`       |
| `.escape`     | `event.key === "Escape"`      |
| `.space`      | `event.key === " "`           |
| `.tab`        | `event.key === "Tab"`         |
| `.arrowup`    | `event.key === "ArrowUp"`     |
| `.arrowdown`  | `event.key === "ArrowDown"`   |
| `.arrowleft`  | `event.key === "ArrowLeft"`   |
| `.arrowright` | `event.key === "ArrowRight"`  |
| `.ctrl`       | `event.ctrlKey`               |
| `.alt`        | `event.altKey`                |
| `.shift`      | `event.shiftKey`              |
| `.meta`       | `event.metaKey` (Cmd on Mac)  |
| `.window`     | Listens on `window` instead   |
| `.document`   | Listens on `document` instead |

A bare `@keydown` runs on any key:
```html
<input @keydown="addClass#pressed" @target="status" />
```

Multiple keys combine with `+`:
```html
<input @keydown.ctrl+k="focus" @target="search-field" />
<input @keydown.shift+enter="addClass#submitted" @target="status" />
```


### Global with `.window`

Add `.window` to run globally regardless of element focus. Editable elements (input, textarea, select, contenteditable) suppress the action when focused:
```html
<div @keydown.meta+s.window="addClass#saved" @target="status">Save</div>
<div @keydown.escape.window="removeAttribute#open" @target="menu">Close</div>
```


## @hotkey

`@hotkey` runs globally, no `.window` required. It handles focus isolation automatically.


### Bare hotkey

Without a value, `@hotkey` calls `element.click()`:
```html
<a href="/inbox" @hotkey.g.i>Inbox (g then i)</button>
<button @hotkey.escape @action="removeAttribute#open" @target="menu">Close</button>
```


### Valued hotkey

With a value, `@hotkey` dispatches a synthetic `hotkey` event through the action pipeline:
```html
<button @hotkey.escape="removeAttribute#open" @target="menu">Close</button>
<button @hotkey.ctrl+k="focus" @target="search">Search</button>
```


### Hotkey syntax

`@hotkey` supports three forms:

| Form       | Example             | Triggers when                          |
| ---------- | ------------------- | -------------------------------------- |
| Single key | `@hotkey.escape`    | Escape is pressed                      |
| Combo (+)  | `@hotkey.ctrl+k`    | `Ctrl` and `K` are held simultaneously     |
| Sequence   | `@hotkey.g.i`       | `G` is pressed, released, then ``I`` pressed |


### Cancellable event

Before the action runs, `@hotkey` dispatches a cancellable `attractive:hotkey` CustomEvent on the element. Call `preventDefault()` to stop the action:
```js
element.addEventListener("attractive:hotkey", (event) => {
  if (someCondition) event.preventDefault();
});
```

The event `detail` includes the matched key `path` array.


### Focus vs click

Hotkeys on form elements (input, textarea, select, contenteditable) focus the element instead of clicking it.
