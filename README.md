> [!NOTE]
> Attractive.js 1.0.0 is in the works. Have your say: https://github.com/Rails-Designer/attractivejs/milestone/2

# Attractive.js

A light-weight library for declarative DOM actions using data attributes.

Quick example:

```html
<button data-action="toggleClass#active" data-target="content">Toggle</button>

<p id="content">This element should toggle the `active` class.</p>
```

There are many more actions, like: `addAttribute`, `copy` (to clipboard), `addElement` and `removeElement`.

**Sponsored By [Rails Designer](https://railsdesigner.com/)**

<a href="https://railsdesigner.com/" target="_blank">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="https://raw.githubusercontent.com/Rails-Designer/rails_icons/HEAD/.github/logo-dark.svg">
    <source media="(prefers-color-scheme: light)" srcset="https://raw.githubusercontent.com/Rails-Designer/rails_icons/HEAD/.github/logo-light.svg">
    <img alt="Rails Designer" src="https://raw.githubusercontent.com/Rails-Designer/rails_icons/HEAD/.github/logo-light.svg" width="240" style="max-width: 100%;">
  </picture>
</a>

## Documentation

📑 [See documentation](https://attractivejs.railsdesigner.com/#get-started) ([built with Perron](https://perron.railsdesigner.com))

## Release

```bash
npm run release  # patch bump (0.12.x → 0.12.y)
npm run release -- minor  # minor bump (0.12.x → 0.13.0)
npm run release -- major  # major bump (0.12.x → 1.0.0)

# Pre-release (alpha)
npm run release -- premajor --preid alpha  # 0.12.x → 1.0.0-alpha.0
npm run release -- prerelease --preid alpha # 1.0.0-alpha.0 → 1.0.0-alpha.1
```

## License

Attractive.js is released under the [MIT License](https://opensource.org/licenses/MIT).
