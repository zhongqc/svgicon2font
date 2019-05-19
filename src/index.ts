import fs from 'fs'
import path from 'path'
import SVGIcons2SVGFontStream from 'svgicons2svgfont'
import svg2ttf from 'svg2ttf'
import { SVGIcon2FontConfig } from './build-config'
import buildConfig from './build-config'

interface IconItem {
  name: string,
  path: string,
  unicode: string[],
  hexCode: string
}

const iconRegexp = /(.svg)$/

class SVGIcon2Font {
  config: SVGIcon2FontConfig

  constructor (initinalConfig: SVGIcon2FontConfig) {
    const config = buildConfig(initinalConfig)
    this.config = config
  }

  getIconList (): IconItem[] {
    return fs.readdirSync(this.config.entry).filter((fileName: string) => iconRegexp.test(fileName)).map((fileName: string, i: number) => {
      let iconCode = this.config.startUnicode! + i;
      return {
        name: fileName.replace(iconRegexp, ''),
        path: path.join(this.config.entry, fileName),
        unicode: [String.fromCharCode(iconCode)],
        hexCode: `\\${iconCode.toString(16)}`
      }
    })
  }

  generateIconFontFace (svgIconBuffer: Buffer) {
    let fontName = this.config.fontName
    return `@font-face {
  font-family: "${fontName}";
  src: url(data:application/x-font-ttf;base64,${this.generateTTFBuffer(svgIconBuffer).toString('base64')}) format('truetype');
}

.${fontName}-icon {
  font-family: "${fontName}" !important;
  font-size: 16px;
  font-style: normal;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}`
  }

  generateSvgIcon (iconList: IconItem[]): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      const svgFontStream = new SVGIcons2SVGFontStream({
        fontName: this.config.fontName
      })
      let generateSvgIconPath = path.join(__filename, '../svgicon.svg')
      svgFontStream.pipe(fs.createWriteStream(generateSvgIconPath))
        .on('finish', function () {
          console.log('Font successfully created!')
          resolve(fs.readFileSync(generateSvgIconPath))
        })
        .on('error', function (err: any) {
          console.log(err);
          reject(err)
        });

      iconList.forEach((icon: IconItem) => {
        const glyph = fs.createReadStream(icon.path) as any
        glyph.metadata = {
          name: icon.name,
          unicode: icon.unicode
        }
        svgFontStream.write(glyph)
      })
      svgFontStream.end()
    })
  }

  generateTTFBuffer (svgIcon: Buffer) {
    const ttf = svg2ttf(svgIcon.toString('utf8'), {})
    return Buffer.from(ttf.buffer)
  }

  generateIconListCssStr (iconList: IconItem[]) {
    let iconPrefix = this.config.iconPrefix ? `${this.config.iconPrefix}-` : ''
    return iconList.map((icon: IconItem) => {
      return `.${iconPrefix}${icon.name}::before {
  content: "${icon.hexCode}";
}`
    }).join('\n\n')
  }

  writeCssFile (fontFace: string, fontListCss: string) {
    if (!fs.existsSync(this.config.output)) {
      fs.mkdirSync(this.config.output)
    }
    fs.writeFileSync(path.join(this.config.output, this.config.iconCssFileName!), fontFace.concat('\n\n', fontListCss, '\n'))
  }
}

export default function (initinalConfig: SVGIcon2FontConfig) {
  let svgIcon2Font = new SVGIcon2Font(initinalConfig)
  let iconList = svgIcon2Font.getIconList();
  svgIcon2Font.generateSvgIcon(iconList).then((svgIconBuffer: Buffer) => {
    let fontFace = svgIcon2Font.generateIconFontFace(svgIconBuffer)
    let fontList = svgIcon2Font.generateIconListCssStr(iconList)
    console.log(fontFace, fontList)
    svgIcon2Font.writeCssFile(fontFace, fontList)
  })
}
