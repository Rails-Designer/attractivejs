---
title: toggleDataAttribute
group: data_attribute
description: Toggle a data attribute on or off via the dataset API
position: 1
---

<div id="card" class="demo-expand">
  <button @action="toggleDataAttribute#expanded" @target="card" class="demo-expand-trigger" aria-controls="card">
    Riley's Studio
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path fill-rule="evenodd" d="M12.53 16.28a.75.75 0 0 1-1.06 0l-7.5-7.5a.75.75 0 0 1 1.06-1.06L12 14.69l6.97-6.97a.75.75 0 1 1 1.06 1.06l-7.5 7.5Z" clip-rule="evenodd"/>
    </svg>
  </button>

  <div class="demo-expand-content">
    <p>24 pieces · Created by Riley · Updated 2h ago</p>
  </div>
</div>
