const path = require('path')

export enum FontFormat {
  eot = 'eot',
  woff2 = 'woff2',
  woff = 'woff',
  ttf = 'ttf',
}

export const FontFormatConfig: {
  [key: string]: {
    contentType: string,
    extensionName: string,
    formatString: string
  }
} = {
  [FontFormat.eot]: {
    contentType: 'application/x-font-eot',
    extensionName: 'eot',
    formatString: 'embedded-opentype'
  },
  [FontFormat.woff2]: {
    contentType: 'application/x-font-woff2',
    extensionName: 'woff2',
    formatString: 'woff2'
  },
  [FontFormat.woff]: {
    contentType: 'application/x-font-woff',
    extensionName: 'woff',
    formatString: 'woff'
  },
  [FontFormat.ttf]: {
    contentType: 'application/x-font-ttf',
    extensionName: 'ttf',
    formatString: 'truetype'
  }
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

export function buildConfig (config: SVGIcon2FontConfig) {
  return Object.assign({}, defaultConfig, config)
}
