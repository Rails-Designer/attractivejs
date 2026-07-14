---
title: put
group: request
builtin: false
description: Send a PUT request
position: 4
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
import { put } from "attractivejs/actions/request";

Attractive.activate({
  addActions: { put }
});
```

<button @action="put /api/replace" @target="output">Replace</button>

<div id="output"></div>
