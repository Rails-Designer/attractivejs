import { defineConfig } from "rolldown";

const actions = [
  { name: "attribute", file: "attribute.js" },
  { name: "class", file: "class.js" },
  { name: "clipboard", file: "clipboard.js" },
  { name: "confirm", file: "confirm.js" },
  { name: "data-attribute", file: "data_attribute.js" },
  { name: "dialog", file: "dialog.js" },
  { name: "focus", file: "focus.js" },
  { name: "form", file: "form.js" },
  { name: "inline", file: "inline.js" },
  { name: "reload", file: "reload.js" },
  { name: "request", file: "request.js" },
  { name: "scroll-to", file: "scroll_to.js" },
  { name: "style", file: "style.js" }
];

const actionConfigs = actions.flatMap(({ name, file }) => [
  defineConfig({
    input: `src/actions/${file}`,
    output: {
      file: `dist/actions/${name}.js`,
      format: "es"
    }
  }),

  defineConfig({
    input: `src/actions/${file}`,
    output: {
      file: `dist/actions/${name}.min.js`,
      format: "es",
      minify: true
    }
  })
]);

export default [
  defineConfig({
    input: "src/index.js",
    output: {
      file: "dist/attractive.js",
      format: "es"
    }
  }),

  defineConfig({
    input: "src/index.js",
    output: {
      file: "dist/attractive.min.js",
      format: "es",
      minify: true
    }
  }),

  defineConfig({
    input: "src/attractive.core.js",
    output: {
      file: "dist/attractive.core.js",
      format: "es"
    }
  }),

  defineConfig({
    input: "src/attractive.core.js",
    output: {
      file: "dist/attractive.core.min.js",
      format: "es",
      minify: true
    }
  }),

  defineConfig({
    input: "src/actions/index.js",
    output: {
      file: "dist/actions/index.js",
      format: "es"
    }
  }),

  defineConfig({
    input: "src/actions/index.js",
    output: {
      file: "dist/actions/index.min.js",
      format: "es",
      minify: true
    }
  }),

  defineConfig({
    input: "src/addons/keyboard/index.js",
    output: {
      file: "dist/keyboard.js",
      format: "es"
    }
  }),

  defineConfig({
    input: "src/addons/keyboard/index.js",
    output: {
      file: "dist/keyboard.min.js",
      format: "es",
      minify: true
    }
  }),

  defineConfig({
    input: "src/addons/reactive/index.js",
    output: {
      file: "dist/reactive.js",
      format: "es"
    }
  }),

  defineConfig({
    input: "src/addons/reactive/index.js",
    output: {
      file: "dist/reactive.min.js",
      format: "es",
      minify: true
    }
  }),

  defineConfig({
    input: "src/addons/attract/index.js",
    output: {
      file: "dist/attract.js",
      format: "es"
    }
  }),

  defineConfig({
    input: "src/addons/attract/index.js",
    output: {
      file: "dist/attract.min.js",
      format: "es",
      minify: true
    }
  }),

  defineConfig({
    input: "src/addons/validate/index.js",
    output: {
      file: "dist/validate.js",
      format: "es"
    }
  }),

  defineConfig({
    input: "src/addons/validate/index.js",
    output: {
      file: "dist/validate.min.js",
      format: "es",
      minify: true
    }
  }),

  ...actionConfigs
];
