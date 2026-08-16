---
title: Quickstart
description: Get started with Attractive.js in one script tag
category: get-started
position: 2
erb: true
---

Get up and running with Attractive.js and this script to your `<head>`.
```html
<script src="//unpkg.com/attractivejs@<%= attractivejs_version %>" type="module" activate></script>
```


## First example

```html
<button @action="toggleClass#active" @target="panel">Toggle</button>

<div id="panel">Content</div>
```
