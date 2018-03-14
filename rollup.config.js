import path from 'path';
import babel from 'rollup-plugin-babel';

export default {
  input: 'src/index.js',
  output: {
    name: 'DragCapture',
  },
  plugins: [
    babel({
      exclude: path.join(__dirname, 'node_modules/**')
    })
  ],
};

