---
title: removeStyle
group: style
description: Remove a CSS property from target elements
position: 2
---

<div id="carousel" class="demo-carousel" style="--index: 3;">
  <div class="demo-track">
    <div class="demo-slide">
      <div class="demo-cover">R</div>

      <div class="demo-slide-label">
        Riley's Studio
        <span>24 pieces</span>
      </div>
    </div>

    <div class="demo-slide">
      <div class="demo-cover cover-2">J</div>

      <div class="demo-slide-label">
        Jordan's Sketchbook
        <span>12 pieces</span>
      </div>
    </div>

    <div class="demo-slide">
      <div class="demo-cover cover-3">A</div>

      <div class="demo-slide-label">
        Avery's Portfolio
        <span>32 pieces</span>
      </div>
    </div>

    <div class="demo-slide">
      <div class="demo-cover cover-4">C</div>

      <div class="demo-slide-label">
        Circle of Prints
        <span>8 pieces</span>
      </div>
    </div>
  </div>
</div>

<button @action="removeStyle#--index" @target="carousel" class="demo-btn ghost">Back to start</button>
