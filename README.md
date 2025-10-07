# Attractive.js

A light-weight library for declarative DOM actions using data attributes.

> When existing libraries are too much, and vanilla JavaScript too little. 🐣

Quick example:
```html
<p>
  This element should toggle the `active` class when clicking the button below.

  <button data-action="toggleClass#active">
    Toggle
  </button>
</p>
```


## Installation

It is simple to get started with Attractive.js. Use it with NPM of directly using a CDN.


### Using NPM/importmap

```bash
npm install attractivejs

# using importmap-rails
./bin/importmap pin attractivejs
```

```javascript
import Attractive from "attractivejs"

// default usage (document as root)
Attractive.activate();

// with custom element
const element = document.getElementById("main");

Attractive.activate({ element: element });

// only with selected actions
Attractive.activate({ element: element }).withActions(["class"]);
```


### Using a CDN

```html
<head>
  <script defer src="https://cdn.jsdelivr.net/npm/attractivejs@1.x.x/dist/cdn.min.js"></script>
</head>
```

Including above script-tag is enough to get started. You can make tweaks to Attractive.js if needed:
```html
<script>
  document.addEventListener("DOMContentLoaded", () => {
    // default usage (document as root)
    Attractive.activate();

    // with custom element
    const element = document.querySelector("#main");
    Attractive.activate({ element: element });

    // only with selected actions
    Attractive.activate({ element: element }).withActions(["class"]);
  });
</script>
```


## Usage

Attractive.js works by setting a `data-action` to an element, typically a button or a-element, and, optionally, a `data-target` attribute (it defaults to the direct parent of the element with the `data-action`). The syntax for the `data-action` attribute is `action#value`, `data-target` accepts an `#id`, `.class` or `[attribute="selector"]`.

### Examples

With an implicit target; the direct parent of the element with `data-action` is used.
```html
<p>
  This element should toggle the `active` class when clicking the button below.

  <button data-action="toggleClass#active">
    Toggle
  </button>
</p>
```

With an explicit target.
```html
<p id="target">
  This element should toggle the `active` class when clicking the button below.
</p>

<button data-action="toggleClass#active" data-target="#target">
  Toggle
</button>
```

Defining multiple classes.
```html
<p>
  This element should toggle the `bg-red-100` and `border-red-300` classes when clicking the button below.

  <button data-action="toggleClass#bg-red-100,border-red-300">
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


## Actions

Attractive.js comes with a fixed set of common actions. _More actions coming. See open issues._


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
