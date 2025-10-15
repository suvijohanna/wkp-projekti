import typescript from 'rollup-plugin-typescript2';

export default [
  {
    input: './src/main.ts',
    output: {
      file: './build/main.js',
      format: 'cjs',
    },
    plugins: [
      typescript({
        tsconfig: "tsconfig.app.json"
      })
    ],
    watch: {
      clearScreen: false,
      include: 'src/**',
      exclude: 'node_modules/**',
    },
  },
  {
    input: './src/sw.ts',
    output: {
      file: './build/sw.js',
      format: 'iife',
    },
    plugins: [
      typescript({
        tsconfig: "tsconfig.sw.json"
      })
    ],
    watch: {
      clearScreen: false,
      include: 'src/**',
      exclude: 'node_modules/**',
    },
  }
];
