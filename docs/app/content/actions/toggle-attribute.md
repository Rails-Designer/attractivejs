---
title: toggleAttribute
group: attribute
description: Toggle an HTML attribute on or off
position: 1
---

<button @action="toggleAttribute#hidden" @target="details" class="demo-btn ghost" aria-controls="details">Show details</button>

<section id="details" class="demo-banner" hidden>
  <p>
    <strong>Trial</strong>
    — your free plan ends in 3 days.
  </p>
</section>
