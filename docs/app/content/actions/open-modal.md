---
title: openModal
group: dialog
description: Open a dialog as a modal
position: 2
---

<button @action="openModal" @target="create" class="demo-btn">Create collection</button>

<dialog id="create" class="demo-dialog" aria-labelledby="create-title">
  <div class="demo-dialog-content">
    <div class="demo-dialog-header">
      <h2 id="create-title">Create collection</h2>

      <button @action="close" @target="create" class="demo-icon-btn" aria-label="Close dialog">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path fill-rule="evenodd" d="M5.47 5.47a.75.75 0 0 1 1.06 0L12 10.94l5.47-5.47a.75.75 0 1 1 1.06 1.06L13.06 12l5.47 5.47a.75.75 0 1 1-1.06 1.06L12 13.06l-5.47 5.47a.75.75 0 0 1-1.06-1.06L10.94 12 5.47 6.53a.75.75 0 0 1 0-1.06Z" clip-rule="evenodd"/>
        </svg>
      </button>
    </div>

    <div class="demo-dialog-body">
      <div class="demo-input-group">
        <label for="collection-name">Name</label>

        <input id="collection-name" class="demo-input" type="text" placeholder="e.g. Porch prints" autofocus>
      </div>

      <div class="demo-dialog-actions">
        <button @action="close" @target="create" type="button" class="demo-btn ghost">Cancel</button>

        <button type="submit" class="demo-btn">Create</button>
      </div>
    </div>
  </div>
</dialog>
