---
title: add
group: element
description: Clone a source element and insert it into the target
position: 1
options:
  - attribute: data-element-source
    description: ID of the source element to clone
    type: string
    required: true
  - attribute: data-element-position
    description: Insert position (beforebegin, afterbegin, beforeend, afterend)
    type: string
    default: beforeend
---

<button @action="add" @target="list" data-element-source="item-template">Add</button>

<ul id="list"></ul>
<template id="item-template"><li>New item</li></template>
