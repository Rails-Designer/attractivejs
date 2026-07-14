---
title: patch
group: request
builtin: false
description: Send a PATCH request
position: 3
options:
  - attribute: data-debounce
    description: Debounce delay in ms before making the request
    type: number
  - attribute: data-request-feedback
    description: Duration in ms before removing busy/success attributes
    type: number
    default: 2000
---

```js
import Attractive from "attractivejs";
import { patch } from "attractivejs/actions/request";

Attractive.activate({
  addActions: { patch }
});
```

<button @action="patch /api/update" @target="output">Update</button>

<div id="output"></div>
