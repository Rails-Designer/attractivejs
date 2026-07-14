---
title: post
group: request
builtin: false
description: Send a POST request
position: 2
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
import { post } from "attractivejs/actions/request";

Attractive.activate({
  addActions: { post }
});
```

<button @action="post /api/save" @target="output">Save</button>

<div id="output"></div>
