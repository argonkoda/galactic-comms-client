import commonjs from '@rollup/plugin-commonjs';
import resolve from '@rollup/plugin-node-resolve';
import json from "@rollup/plugin-json";

function renderer() {
  return {
    name: 'renderer',
    resolveId(source) {
      if (source === 'renderer') {return source}
      return null;
    },
    load(id) {
      if (id === 'renderer') {return `export default new URL(${
        process.env.BUILD === "development" ? '"http://localhost:5173"' : '"file://" + require("path").join(__dirname, "renderer/index.html")'
      }).href;`};
      return null;
    }
  }
}

export default {
  external: [
    'electron',
    /^node:/,
    // 'renderer'
  ],
  plugins: [
    renderer(),
    resolve({}),
    commonjs(),
    json(),
  ],
  input: {'background': 'src/background.js', 'preload': 'src/preload.js'},
  output: {
    dir: 'dist',
    format: 'cjs',
    globals: {
      // 'renderer': 'RENDERER_FILE_PATH'
    },
    entryFileNames: '[name].cjs'
  }
}
