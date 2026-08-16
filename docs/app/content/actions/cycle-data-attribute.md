---
title: cycleDataAttribute
group: data_attribute
description: Cycle a data attribute through comma-separated values
position: 5
---

<div id="tabs" class="demo-tabs" data-tab="explore">
  <button @action="cycleDataAttribute#tab=explore,studio,circles" @target="tabs" class="demo-btn ghost">Next tab</button>

  <section class="demo-tab-panel" data-content="explore">
    <h3>Explore</h3>

    <p>New pieces from people you follow.</p>
  </section>

  <section class="demo-tab-panel" data-content="studio">
    <h3>Studio</h3>

    <p>Your recent uploads and drafts.</p>
  </section>

  <section class="demo-tab-panel" data-content="circles">
    <h3>Circles</h3>

    <p>Collections shared with your inner circle.</p>
  </section>
</div>
