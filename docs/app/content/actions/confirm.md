---
title: confirm
group: confirm
description: Show a confirmation dialog before proceeding
position: 1
options:
  - attribute: data-confirm-message
    description: Custom confirmation message
    type: string
    default: Are you sure?
  - attribute: data-confirm-feedback
    description: Duration in ms before removing the success attribute
    type: number
    default: 2000
---

<button @action="confirm" data-confirm-message="Delete this item?">Delete</button>
