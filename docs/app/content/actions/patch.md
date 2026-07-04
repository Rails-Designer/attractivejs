---
title: patch
group: request
description: Send a PATCH request
position: 3
options:
  - attribute: data-request-debounce
    description: Debounce delay in ms before making the request
    type: number
  - attribute: data-request-feedback
    description: Duration in ms before removing busy/success attributes
    type: number
    default: 2000
---

<button on="patch /api/update" on-target="output">Update</button>

<div id="output"></div>
