---
title: close
group: dialog
description: Close a dialog element
position: 3
---

<dialog id="welcome" class="demo-dialog" open aria-labelledby="welcome-title">
  <div class="demo-dialog-content">
    <div class="demo-dialog-header">
      <h2 id="welcome-title">Welcome to Studio</h2>

      <button @action="close" @target="welcome" class="demo-icon-btn" aria-label="Dismiss welcome">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path fill-rule="evenodd" d="M5.47 5.47a.75.75 0 0 1 1.06 0L12 10.94l5.47-5.47a.75.75 0 1 1 1.06 1.06L13.06 12l5.47 5.47a.75.75 0 1 1-1.06 1.06L12 13.06l-5.47 5.47a.75.75 0 0 1-1.06-1.06L10.94 12 5.47 6.53a.75.75 0 0 1 0-1.06Z" clip-rule="evenodd"/></svg>
      </button>
    </div>

    <div class="demo-dialog-body">
      <p>Your gallery is ready. Start by creating your first collection.</p>

      <div class="demo-dialog-actions">
        <button @action="close" @target="welcome" class="demo-btn">Get started</button>
      </div>
    </div>
  </div>
</dialog>
