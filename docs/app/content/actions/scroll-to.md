---
title: scrollTo
group: scroll_to
description: Scroll a target element into view
position: 1
---

<button @action="scrollTo" @target="comments" class="demo-btn">Jump to replies</button>

<div class="demo-scroll-spacer">Scroll down to the comment thread</div>

<section id="comments" class="demo-scroll-target">
  <h3>Comments</h3>
</section>
