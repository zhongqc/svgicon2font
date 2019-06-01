import typescript from 'rollup-plugin-typescript2'
import resolve from 'rollup-plugin-node-resolve'
import commonjs from 'rollup-plugin-commonjs'

const version = require('./package.json').version

const banner =
`/*!
 * SVGIcon2Font v${version}
 * (c) 2019-${new Date().getFullYear()} Zhongqc
 * Released under the MIT License.
 */`

export default {
  input: 'src/index.ts',
  output: {
    file: 'lib/index.js',
    format: 'cjs',
    name: 'SVGIcon2Font',
    sourcemap: true,
    banner
  },
  plugins: [
    typescript({
      useTsconfigDeclarationDir: true
    }),
    resolve(),
    commonjs()
  ],
  external: ['fs', 'path', 'svgicons2svgfont', 'svg2ttf', 'ttf2eot', 'ttf2woff', 'ttf2woff2']
}
