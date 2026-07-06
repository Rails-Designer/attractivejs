---
title: cycleStyle
group: style
description: Cycle a CSS property through comma-separated values
position: 3
---

<button @action="cycleStyle#--bg=red,green,blue" @target="card">Cycle</button>

<div id="card" style="--bg: red; background: var(--bg); padding: var(--spacing-4); border: 1px solid var(--gray-700); border-radius: var(--spacing-2); transition: background .3s;">Content</div>
