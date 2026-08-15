---
title: openModal
group: dialog
description: Open a dialog as a modal
position: 2
note: |
  **Note:** Native HTML also has the `commandfor` attribute (the Invoker Commands API) to show and close a dialog without JavaScript. It supports only a handful of commands and no way to combine multiple actions at once, so Attractive.js provides the `openModal` action.
---

<button @action="openModal" @target="my-dialog">Open modal</button>

<dialog id="my-dialog">Modal content</dialog>
