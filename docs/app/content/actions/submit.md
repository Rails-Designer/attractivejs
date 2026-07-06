---
title: submit
group: form
description: Programmatically submit a form
position: 1
options:
  - attribute: data-form-debounce
    description: Debounce delay in ms before submitting
    type: number
---

<button @action="submit" @target="my-form">Submit</button>

<form id="my-form"><input name="email"></form>
