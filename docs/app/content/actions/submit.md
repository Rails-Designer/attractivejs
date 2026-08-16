---
title: submit
group: form
description: Programmatically submit a form
position: 1
options:
  - attribute: data-debounce
    description: Debounce delay in ms before submitting
    type: number
---

<form id="invite" class="demo-form">
  <div class="demo-input-group">
    <label for="invite-email">Email</label>

    <input id="invite-email" class="demo-input" name="email" type="email" placeholder="riley@studio.app">
  </div>
</form>

<button @action="submit" @target="invite" class="demo-btn">Send invite</button>
