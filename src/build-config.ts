const path = require('path')

export enum FontFormat {
  ttf = 'ttf',
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
  console.log(config, defaultConfig, Object.assign({}, defaultConfig, config))
  return Object.assign({}, defaultConfig, config)
}
