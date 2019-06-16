# svgicon2font
svg icons package to web font

## Usage
install
```bash
npm install svgicon2font
# or
yarn add svgicon2font
```
example
```typescript
const svgIcon2Font = require('svgicon2font').svgIcon2Font

/**
 * @param {SVGIcon2FontConfig} initinalConfig
 *
 * @type {SVGIcon2FontConfig}
 * export interface SVGIcon2FontConfig {
 *   entry: string;  // you svg icon path
 *   output: string;  // css file write position
 *   iconCssFileName?: string;  // css file name
 *   fontName: string;  // font face name @default('iconfont')
 *   iconPrefix?: string;  // icon class prefix
 *   inline?: boolean;  // use base64 string in css file or write alone font file
 *   formats?: FontFormat[];  // font format you need, support eot ttf woff woff2
 *   startUnicode?: number;  // icon start unicode
 * }
 */
svgIcon2Font(initinalConfig: SVGIcon2FontConfig)
```
or
```typescript
svgIcon2Font(initinalConfig: SVGIcon2FontConfig).then(() => {
  // execute after build
})

```

## Feature

## Contact

- [Zhongqc](mailto:zhongqc7@gmail.com)

## License

[MIT](http://opensource.org/licenses/MIT)

Copyright (c) 2019-present, Zhongqc
