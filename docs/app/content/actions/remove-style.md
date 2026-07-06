---
title: removeStyle
group: style
description: Remove a CSS property from target elements
position: 2
---

<button @action="removeStyle#--bg" @target="card">Remove</button>

<div id="card" style="--bg: blue; background: var(--bg); padding: var(--spacing-4); border: 1px solid var(--gray-700); border-radius: var(--spacing-2); transition: background .3s;">Content</div>
