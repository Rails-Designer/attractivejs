import resolve from "@rollup/plugin-node-resolve";
import { terser } from "rollup-plugin-terser";

export default [
  // ESM build (for bundlers and importmaps)
  {
    input: "src/index.js",
    output: {
      file: "dist/attractive.js",
      format: "es"
    },

    plugins: [resolve()]
  },

  // Minified ESM build (for CDN)
  {
    input: "src/index.js",
    output: {
      file: "dist/attractive.min.js",
      format: "es"
    },

    plugins: [resolve(), terser()]
  }
];
