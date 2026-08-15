---
title: open
group: dialog
description: Open a dialog element
position: 1
note: |
  **Note:** Native HTML also has the `commandfor` attribute (the Invoker Commands API) to show and close a dialog without JavaScript. It supports only a handful of commands and no way to combine multiple actions at once, so Attractive.js provides the `open` action.
---

<button @action="open" @target="my-dialog">Open</button>

<dialog id="my-dialog">Dialog content</dialog>
