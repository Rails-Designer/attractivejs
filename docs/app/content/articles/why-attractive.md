---
title: Why Attractive.js?
description: 99% of static sites and server-rendered apps don't need heavy frameworks
category: get-started
position: 1
---

Most static sites and server-rendered apps only need small touches of interactivity: a toggle, a dropdown, a dialog, a copy button. Reaching for a framework drags in a virtual DOM, a build step and a new way of thinking, for what is often a few lines of behavior.

Attractive.js puts that behavior directly in your HTML. You declare what you want on the element itself, no JavaScript of your own required:

```html
<button
  @action="toggleClass#active"
  @target="panel"
>
  Toggle
</button>

<div id="panel">Content</div>
```

That's the whole interaction. No component, no store, no wiring, just an attribute that says what happens and one that says where.


## Declarative, not reactive

Attractive.js is not a framework. There is no virtual DOM, no state management, no component lifecycle to learn. There are just actions: small, focused behaviors that run on events like `click`, `input` and `submit`.

```html
<button @action="copy" @target="code">Copy</button>

<button @action="openModal" @target="modal">Sign up</button>

<form @action="toggleClass#submitted:preventDefault">Submit</form>
```

Reading the markup tells you what the page does.


## Common cases covered, out of the box

[Bundled actions](/docs/actions/) handle the everyday interactions without any code of your own: toggling classes, attributes and styles, copying to the clipboard, confirming destructive actions, focusing fields, opening dialogs, submitting and resetting forms.

When behavior grows beyond that, the same system composes:

- [Triggers and gates](/docs/directives/) run actions on scroll, once, or guarded by conditions
- [Custom actions](/docs/custom-actions/) let you write one function or class and use it from HTML everywhere
- [Keyboard](/docs/keyboard/) adds `@keydown.enter` and global `@hotkey` shortcuts
- [Reactive](/docs/reactive/) adds a shared store with DOM bindings that update text automatically
- [Attract](/docs/attract/) gives optimistic UI from a cached `<template>`, no page reload

## One script tag, or exactly what you need

Start with a single script tag, and that's the whole setup. Prefer a custom bundle? The [core build](/docs/core-build/) lets you import only the actions you actually use. Same actions, same syntax, nothing more than you need.

Ready to try it? [Get started](/docs/quickstart/) in one script tag.
