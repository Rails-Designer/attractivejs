# Attractive.js

A light-weight library for declarative DOM actions using data attributes.

> When existing libraries are too much, and vanilla JavaScript too little. 🐣

Quick example:
```html
<button data-action="toggleClass#active" data-target="#target">
  Toggle
</button>

<p id="target" class="target">
  This element should toggle the `active` class when the above button is clicked.
</p>
```


## Installation

```bash
npm install attractivejs

# Using importmap-rails
./bin/importmap pin attractivejs
```

```javascript
import Attractive from "attractivejs"

// Default usage
Attractive.activate();

// With custom element
const element = document.getElementById("main");

Attractive.activate({ element: element });

Attractive.activate({ element: element }).withActions(["class"]);
```


### Using a CDN:

```html
<script defer src="https://cdn.jsdelivr.net/npm/attractivejs@1.x.x/dist/cdn.min.js"></script>

<script>
  document.addEventListener("DOMContentLoaded", () => {
    // Default usage (document as root)
    Attractive.activate();

    // Or with a custom element
    const element = document.querySelector("#main");

    Attractive.activate({ element: element });
    Attractive.activate({ element: element }).withActions(["class"]);
  });
</script>
```


## Usage

Attractive.js works by setting a `data-action` to an element, typically a button or a-element, and, optionally, a `data-target` attribute. The syntax for the `data-action` attribute is `action#value`, `data-target` accepts an `#id` or `.class`.


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


_More actions coming. See open issues._

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
