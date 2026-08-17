---
title: removeDataAttribute
group: data_attribute
description: Remove a data attribute via the dataset API
position: 3
---

<div class="demo-gallery">
  <article id="piece" class="demo-item" data-selected>
    <span class="demo-check">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path fill-rule="evenodd" d="M19.916 4.626a.75.75 0 0 1 .208 1.04l-9 13.5a.75.75 0 0 1-1.154.114l-6-6a.75.75 0 0 1 1.06-1.06l5.353 5.353 8.493-12.74a.75.75 0 0 1 1.04-.207Z" clip-rule="evenodd"/>
      </svg>
    </span>

    <div class="demo-cover cover-3">A</div>

    <h3>Avery's Portfolio</h3>

    <p>32 pieces</p>
  </article>
</div>

<button @action="removeDataAttribute#selected" @target="piece" class="demo-btn ghost">Deselect</button>
