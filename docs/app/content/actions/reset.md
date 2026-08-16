---
title: reset
group: form
description: Programmatically reset a form
position: 2
---

<form id="filters" class="demo-form">
  <div class="demo-input-group">
    <label for="filter-search">Search</label>

    <input id="filter-search" class="demo-input" name="search" type="search" value="prints">
  </div>

  <div class="demo-input-group">
    <label for="filter-status">Status</label>

    <select id="filter-status" class="demo-input" name="status">
      <option selected>Draft</option>
      <option>Review</option>
      <option>Published</option>
    </select>
  </div>
</form>

<button @action="reset" @target="filters" class="demo-btn ghost">Reset filters</button>
