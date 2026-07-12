---
title: Events
description: Control which events trigger your actions with @action or explicit event attributes
category: basics
position: 3
---

## Default events

`@action` uses the element's default event:

| Element          | Default event |
| ---------------- | ------------- |
| `<button>`       | `click`       |
| `<a>`            | `click`       |
| `<input type="submit">` | `click` |
| `<input>` / `<textarea>` | `input` |
| `<input type="checkbox">` | `change` |
| `<select>`       | `change`      |
| `<form>`         | `submit`      |


## Explicit events

Use the event name as the attribute to override the default:

```html
<button @mouseenter="addClass#hovered" @mouseleave="removeClass#hovered">Hover</button>
<input @input="addClass#dirty">
<button @dblclick="toggleClass#selected" />
<input @focus="addClass#focused" @blur="removeClass#focused" />
```

Any standard DOM event works as an attribute name. For example `@click`, `@mouseenter`, `@change`, `@submit`, `@input`, `@focus`, `@blur`, `@dblclick`, `@scroll` and more.


## Listening on window or document

Add `.window` or `.document` to listen on the window or document instead of the element:

```html
<div @click.window="removeClass#open:whenOutside" />
<button @click.document="focus" @target="search">Focus search</button>
```
