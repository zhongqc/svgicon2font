const path = require('path')

enum FontFormat {
  ttf = 'ttf',
  svg = 'svg',
  eot = 'eot',
  woff = 'woff',
  woff2 = 'woff2'
}

export interface SVGIcon2FontConfig {
  entry: string,
  output: string,
  iconCssFileName?: string,
  fontName: string,
  iconPrefix?: string,
  inline?: boolean,
  formats?: FontFormat[],
  startUnicode?: number,
}

const defaultConfig: SVGIcon2FontConfig = {
  entry: path.join(__dirname, '../icons'),
  output: path.join(__dirname, '../css'),
  iconCssFileName: 'icon.css',
  fontName: 'iconfont',
  iconPrefix: '',
  inline: true,
  formats: [FontFormat.ttf],
  startUnicode: 0xea01,
}

export default function (config: SVGIcon2FontConfig) {
  return Object.assign({}, config, defaultConfig)
}
