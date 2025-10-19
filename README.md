# Attractive.js

A light-weight library for declarative DOM actions using data attributes.

Quick example:
```html
<p id="content">
  This element should toggle the `active` class when clicking the button below.

  <button data-action="toggleClass#active" data-target="#content">
    Toggle
  </button>
</p>
```


**Sponsored By [Rails Designer](https://railsdesigner.com/)**

<a href="https://railsdesigner.com/" target="_blank">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="https://raw.githubusercontent.com/Rails-Designer/rails_icons/HEAD/.github/logo-dark.svg">
    <source media="(prefers-color-scheme: light)" srcset="https://raw.githubusercontent.com/Rails-Designer/rails_icons/HEAD/.github/logo-light.svg">
    <img alt="Rails Designer" src="https://raw.githubusercontent.com/Rails-Designer/rails_icons/HEAD/.github/logo-light.svg" width="240" style="max-width: 100%;">
  </picture>
</a>


## Documentation

📑 [See the docs site (built with Perron)](https://attractivejs.railsdesigner.com/#get-started)


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
