---
title: cycleDataAttribute
group: data_attribute
description: Cycle a data attribute through comma-separated values
position: 5
---

<button @action="cycleDataAttribute#state=one,two,three" @target="page">Cycle state</button>

<div id="page" data-state="one">
  <span data-content="one">First content</span>
  <span data-content="two">Second content</span>
  <span data-content="three">Third content</span>
</div>
