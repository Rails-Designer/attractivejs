---
title: remove
group: element
description: Remove elements from the DOM
position: 2
options:
  - attribute: data-remove-delay
    description: Delay in ms before removing the element
    type: number
---

<button @action="remove" @target="item">Remove</button>

<div id="item">Item to remove</div>
