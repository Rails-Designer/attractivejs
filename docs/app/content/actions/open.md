---
title: open
group: dialog
description: Open a dialog element
position: 1
---

<button @action="open" @target="preview" class="demo-btn">Quick preview</button>

<dialog id="preview" class="demo-dialog" aria-labelledby="preview-title">
  <div class="demo-dialog-content">
    <div class="demo-dialog-header">
      <h2 id="preview-title">Riley's Studio</h2>

      <button @action="close" @target="preview" class="demo-icon-btn" aria-label="Close preview">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path fill-rule="evenodd" d="M5.47 5.47a.75.75 0 0 1 1.06 0L12 10.94l5.47-5.47a.75.75 0 1 1 1.06 1.06L13.06 12l5.47 5.47a.75.75 0 1 1-1.06 1.06L12 13.06l-5.47 5.47a.75.75 0 0 1-1.06-1.06L10.94 12 5.47 6.53a.75.75 0 0 1 0-1.06Z" clip-rule="evenodd"/></svg>
      </button>
    </div>

    <div class="demo-dialog-body">
      <div class="demo-cover">R</div>

      <p>24 pieces · Private collection · Updated 2h ago</p>
    </div>
  </div>
</dialog>
