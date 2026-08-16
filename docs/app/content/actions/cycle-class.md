---
title: cycleClass
group: class
description: Cycle through class names, replacing the current one with the next in the list
position: 5
---

<button @action="cycleClass#draft,review,published" @target="badge" class="demo-btn ghost">Advance status</button>

<span id="badge" class="demo-badge draft">
  <span class="dot"></span>
  Status
</span>
