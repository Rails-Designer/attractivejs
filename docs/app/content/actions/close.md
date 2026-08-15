---
title: close
group: dialog
description: Close a dialog element
position: 3
note: |
  **Note:** Native HTML also has the `commandfor` attribute (the Invoker Commands API) to show and close a dialog without JavaScript. It supports only a handful of commands and no way to combine multiple actions at once, so Attractive.js provides the `close` action.
---

<button @action="close" @target="my-dialog">Close</button>

<dialog id="my-dialog" open>Dialog content</dialog>
