import resolve from '@rollup/plugin-node-resolve';
import { terser } from 'rollup-plugin-terser';

export default [
  // UMD build (for browsers and CDN)
  {
    input: 'src/index.js',
    output: {
      name: 'Attractive',
      file: 'dist/attractive.js',
      format: 'umd'
    },
    plugins: [resolve()]
  },
  // Minified UMD build (for production CDN use)
  {
    input: 'src/index.js',
    output: {
      name: 'Attractive',
      file: 'dist/attractive.min.js',
      format: 'umd'
    },
    plugins: [resolve(), terser()]
  },
  // ESM build (for modern bundlers)
  {
    input: 'src/index.js',
    output: {
      file: 'dist/attractive.esm.js',
      format: 'es'
    },
    plugins: [resolve()]
  }
];
