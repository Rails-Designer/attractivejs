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

<button on="copy" on-target="source">Copy</button>
<span id="source">Text to copy to clipboard</span>
