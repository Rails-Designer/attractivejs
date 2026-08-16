---
title: copy
group: clipboard
description: Copy text to the clipboard
position: 1
options:
  - attribute: data-copy-feedback
    description: Duration in ms before removing the success/failure attribute
    type: number
    default: 2000
---

<div class="demo-copy-row">
  <code id="invite-url" class="demo-copy-target">https://studio.app/c/Gy9Kx</code>

  <button @action="copy" @target="invite-url" data-copy-feedback="2000" class="demo-btn ghost">
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path fill-rule="evenodd" d="M10.5 3A1.501 1.501 0 0 0 9 4.5h6A1.5 1.5 0 0 0 13.5 3h-3Zm-2.693.178A3 3 0 0 1 10.5 1.5h3a3 3 0 0 1 2.694 1.678c.497.042.992.092 1.486.15 1.497.173 2.57 1.46 2.57 2.929V19.5a3 3 0 0 1-3 3H6.75a3 3 0 0 1-3-3V6.257c0-1.47 1.073-2.756 2.57-2.93.493-.057.989-.107 1.487-.15Z" clip-rule="evenodd"/></svg>

    <span class="demo-copy-label">Copy</span>
    <span class="demo-copy-success">Copied!</span>
  </button>
</div>
