---
title: put
group: request
description: Send a PUT request
position: 4
options:
  - attribute: data-request-debounce
    description: Debounce delay in ms before making the request
    type: number
  - attribute: data-request-feedback
    description: Duration in ms before removing busy/success attributes
    type: number
    default: 2000
---

<button @action="put /api/replace" @target="output">Replace</button>

<div id="output"></div>
