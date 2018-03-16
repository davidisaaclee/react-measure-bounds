import path from 'path';
import babel from 'rollup-plugin-babel';
import peerDepsExternal from 'rollup-plugin-peer-deps-external';
import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';

export default {
  input: 'src/index.js',
  output: {
    name: 'DragCapture',
		globals: {
			'react': 'React',
		},
  },
  plugins: [
    babel({
			exclude: path.join(__dirname, 'node_modules/**'),
			plugins: ["babel-plugin-external-helpers"]
    }),
		peerDepsExternal(),
		commonjs(),
		resolve(),
  ],
};

