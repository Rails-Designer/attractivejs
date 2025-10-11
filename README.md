# Attractive.js

A light-weight library for declarative DOM actions using data attributes.

> When existing libraries are too much, and vanilla JavaScript too little. 🐣

Quick example:
```html
<p id="content">
  This element should toggle the `active` class when clicking the button below.

  <button data-action="toggleClass#active" data-target="#content">
    Toggle
  </button>
</p>
```


## Installation

Attractive.js can be installed via NPM or included directly using a CDN.


### Using NPM/importmap

```bash
npm install attractivejs

# using importmap-rails
./bin/importmap pin attractivejs
```

```javascript
import Attractive from "attractivejs";

// default usage (document as root)
Attractive.activate();

// selected element as root
const element = document.getElementById("main");
Attractive.activate({ element: element });

// only with selected actions
Attractive.activate({ element: element }).withActions(["class", "attribute"]);
```


### Using a CDN

```html
<head>
  <script defer src="https://cdn.jsdelivr.net/npm/attractivejs@1.x.x/dist/cdn.min.js"></script>
</head>
```

Including above script-tag is enough to get started. Configure Attractive.js if needed:
```html
<script>
  document.addEventListener("DOMContentLoaded", () => {
    // default usage (document as root)
    Attractive.activate();

    // selected element as root
    const element = document.querySelector("#main");
    Attractive.activate({ element: element });

    // only with selected actions
    Attractive.activate({ element: element }).withActions(["class", "attribute"]);
  });
</script>
```


## Usage

Attractive.js works by setting a `data-action` attribute to an element, typically a button or a-element, and, optionally, a `data-target` attribute (by default, the action applies to the element itself). The syntax for the `data-action` attribute is, most commonly, `action#value`, `data-target` accepts an `#id`, `.class` or `[attribute="selector"]` (anything that can be passed to `querySelectorAll()`).


### Examples

```html
<p id="content">
  This element should have the `active` class toggled when clicking the button below.

  <button data-action="toggleClass#active" data-target="#content">
    Toggle
  </button>
</p>
```

Without an explicit target.
```html
<button data-action="toggleClass#active">
  Toggle (this button should have the `active` class toggled)
</button>
```

Defining multiple classes.
```html
<p id="content">
  This element should have the `bg-red-100` and `border-red-300` classes toggled when clicking the button below.

  <button data-action="toggleClass#bg-red-100,border-red-300" data-target="#content">
    Toggle
  </button>
</p>
```

Toggling an attribute.
```html
<details open id="details">
  <summary>
    See all the details
  </summary>

  <p>These are some interesting details!</p>
</details>

<button data-action="toggleAttribute#open" data-target="#details">Toggle details</button>
```

Setting an attribute and value.
```html
<input id="input" type="text">

<button data-action="toggleAttribute#disabled=disabled" data-target="#input">
  Toggle disabled state
</button>
```


### Events

Actions run using default event listeners based on HTML element types. Attractive.js automatically assigns appropriate events.

| Element | Default event |
|:------------|:-------------|
| `<a>`, `<button>` | `click` |
| `<input type="text">` | `input` |
| `<input type="checkbox">`, `<input type="radio">` | `change` |
| `<input type="submit">`, `<input type="button">` | `click` |
| `<select>` | `change` |
| `<textarea>` | `input` |
| `<form>` | `submit` |
| Other elements | `click` |

Custom events can be specified using the arrow syntax: `event->action`. For example:
```html
<button data-action="mouseover->addClass#highlight focus->addClass#active">
  Hover or focus me
</button>
```


## Actions

Attractive.js comes with a fixed set of common actions.


### Classes

- `addClass`
- `removeClass`
- `toggleClass`


### Attributes

- `addAttribute`
- `removeAttribute`
- `toggleAttribute`


### Data Attributes

- `addDataAttribute`
- `removeDataAttribute`
- `toggleDataAttribute`


### Dialog

- `dialog#open`
- `dialog#openModal`
- `dialog#close`


### Form

Define a debounce (delay) for the submit action with `data-submit-delay="n"` (`n` is in ms).

- `form#submit`
- `form#reset`


### Clipboard

Define a feedback duration with `data-copy-duration="n"` (`n` is in ms).

- `copy#string`
- `copy` (no value; assumes a `data-target` to be copyable)


### ScrollTo

- `scrollTo`
- `scrollTo#{auto,instant,smooth}` (`auto` is default using the value set via CSS)


## Development/test

Run `npm run test`.


## Release

Because I always forget how to do this and don't feel like pulling a third-party dependency for releasing.

```bash
npm version patch # or minor, or major
npm publish
git push
git push --tags
```


## License

Attractive.js is released under the [MIT License](https://opensource.org/licenses/MIT).
