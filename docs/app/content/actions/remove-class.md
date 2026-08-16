---
title: removeClass
group: class
description: Remove CSS classes from one or more elements
position: 3
---

<div id="email" class="demo-input-group error">
  <label for="email-input">Email</label>

  <input id="email-input" class="demo-input" type="email" value="riley@">
</div>

<button @action="removeClass#error" @target="email" class="demo-btn ghost">Clear error</button>
