import resolve from "@rollup/plugin-node-resolve";
import { terser } from "rollup-plugin-terser";

const actions = [
  { name: "class", file: "class.js" },
  { name: "clipboard", file: "clipboard.js" },
  { name: "confirm", file: "confirm.js" },
  { name: "data-attribute", file: "data_attribute.js" },
  { name: "dialog", file: "dialog.js" },
  { name: "element", file: "element.js" },
  { name: "focus", file: "focus.js" },
  { name: "form", file: "form.js" },
  { name: "reload", file: "reload.js" },
  { name: "request", file: "request.js" },
  { name: "scroll-to", file: "scroll_to.js" },
  { name: "attribute", file: "attribute.js" }
];

const outputs = actions.flatMap(({ name, file }) => [
  {
    input: `src/actions/${file}`,
    output: {
      file: `dist/actions/${name}.js`,
      format: "es"
    },
    plugins: [resolve()]
  },
  {
    input: `src/actions/${file}`,
    output: {
      file: `dist/actions/${name}.min.js`,
      format: "es"
    },
    plugins: [resolve(), terser()]
  }
]);

outputs.push(
  {
    input: "src/actions/index.js",
    output: {
      file: "dist/actions/index.js",
      format: "es"
    },
    plugins: [resolve()]
  },
  {
    input: "src/actions/index.js",
    output: {
      file: "dist/actions/index.min.js",
      format: "es"
    },
    plugins: [resolve(), terser()]
  }
);

export default [
  // Full ESM build (for bundlers and importmaps)
  {
    input: "src/index.js",
    output: {
      file: "dist/attractive.js",
      format: "es"
    },

    plugins: [resolve()]
  },

  // Minified full ESM build (for CDN)
  {
    input: "src/index.js",
    output: {
      file: "dist/attractive.min.js",
      format: "es"
    },

    plugins: [resolve(), terser()]
  },

  // Core ESM build (engine only)
  {
    input: "src/attractive.core.js",
    output: {
      file: "dist/attractive.core.js",
      format: "es"
    },

    plugins: [resolve()]
  },

  // Core minified ESM build
  {
    input: "src/attractive.core.js",
    output: {
      file: "dist/attractive.core.min.js",
      format: "es"
    },

    plugins: [resolve(), terser()]
  },

  ...outputs
];
