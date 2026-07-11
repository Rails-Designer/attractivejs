---
title: get
group: request
description: Fetch HTML via GET request
position: 1
options:
  - attribute: data-debounce
    description: Debounce delay in ms before making the request
    type: number
  - attribute: data-request-feedback
    description: Duration in ms before removing busy/success attributes
    type: number
    default: 2000
---

<button @action="get /api/content" @target="output">Load</button>

<div id="output"></div>
