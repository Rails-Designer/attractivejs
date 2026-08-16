---
title: toggleClass
group: class
description: Toggle CSS classes on one or more elements
position: 1
---

<button @action="toggleClass#flipped" @target="gallery-card" class="demo-btn ghost">Flip card</button>

<article id="gallery-card" class="demo-card-3d">
  <div class="face">
    <span class="demo-avatar">R</span>

    <h3>Riley's Studio</h3>

    <p>24 pieces · Private</p>
  </div>

  <div class="face back">
    <h3>Riley's Studio</h3>

    <p>Created by Riley</p>
    <p>Updated 2h ago</p>
  </div>
</article>
