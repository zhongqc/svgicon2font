import fs from 'fs'
import path from 'path'
import SVGIcons2SVGFontStream from 'svgicons2svgfont'
import svg2ttf from 'svg2ttf'
import ttf2eot from 'ttf2eot'
import ttf2woff from 'ttf2woff'
import ttf2woff2 from 'ttf2woff2'
import { buildConfig, SVGIcon2FontConfig, FontFormat, FontFormatConfig } from './build-config'

interface IconItem {
  name: string,
  path: string,
  unicode: string[],
  hexCode: string
}

interface IconBuffer {
  ttfBuffer?: Buffer,
  eotBuffer?: Buffer,
  woffBuffer?: Buffer,
  woff2Buffer?: Buffer
}

const iconRegexp = /(.svg)$/

class SVGIcon2Font {
  config: SVGIcon2FontConfig
  iconList: IconItem[]
  iconFontFileList: { [key: string]: Buffer } = {}

  constructor (initinalConfig: SVGIcon2FontConfig) {
    const config = buildConfig(initinalConfig)
    this.config = config
    this.iconList = this.getIconList()
    this.mkOutputDir()
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

  mkOutputDir () {
    if (!fs.existsSync(this.config.output)) {
      fs.mkdirSync(this.config.output)
    }
  }

  async writeFile () {
    let iconBuffer = await this.generateIconBuffer()
    fs.writeFileSync(path.join(this.config.output, this.config.iconCssFileName!), this.generateIconFontFace(iconBuffer).concat('\n\n', this.generateIconListCssStr(this.iconList), '\n'))
    for (let fileName in this.iconFontFileList) {
      fs.writeFileSync(path.join(this.config.output, fileName), this.iconFontFileList[fileName])
    }
  }

  async generateIconBuffer () {
    let fontFormats = this.config.formats!
    let svgIconBuffer = await this.generateSvgIcon(this.iconList)
    let ttfBuffer = this.generateTTFBuffer(svgIconBuffer)
    let iconBuffer: IconBuffer = {
      ttfBuffer: fontFormats.includes(FontFormat.ttf) ? ttfBuffer : undefined,
      eotBuffer: fontFormats.includes(FontFormat.eot) ? this.generateEOTBuffer(ttfBuffer) : undefined,
      woffBuffer: fontFormats.includes(FontFormat.woff) ? this.generateWoffBuffer(ttfBuffer) : undefined,
      woff2Buffer: fontFormats.includes(FontFormat.woff2) ? this.generateWoff2Buffer(ttfBuffer) : undefined
    }
    return iconBuffer
  }

  generateIconFontFace (iconBuffer: IconBuffer) {
    let fontName = this.config.fontName
    return `@font-face {
  font-family: "${fontName}";
  ${this.generateIconFontContent(iconBuffer)}
}

.${fontName}-icon {
  font-family: "${fontName}" !important;
  font-size: 16px;
  font-style: normal;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}`
  }

  generateIconListCssStr (iconList: IconItem[]) {
    let iconPrefix = this.config.iconPrefix ? `${this.config.iconPrefix}-` : ''
    return iconList.map((icon: IconItem) => {
      return `.${iconPrefix}${icon.name}::before {
  content: "${icon.hexCode}";
}`
    }).join('\n\n')
  }

  generateIconFontContent (iconBuffer: IconBuffer): string {
    let srcStringBuilder: string[] = []
    let eotIE9Str: string = ''
    if (iconBuffer.eotBuffer) {
      eotIE9Str = `src: ${this.getIconURLContent(FontFormat.eot, iconBuffer.eotBuffer, true)} /* IE9 */;
  `
      srcStringBuilder.push(this.getIconURLContent(FontFormat.eot, iconBuffer.eotBuffer))
    }
    if (iconBuffer.woff2Buffer) {
      srcStringBuilder.push(this.getIconURLContent(FontFormat.woff2, iconBuffer.woff2Buffer))
    }
    if (iconBuffer.woffBuffer) {
      srcStringBuilder.push(this.getIconURLContent(FontFormat.woff, iconBuffer.woffBuffer))
    }
    if (iconBuffer.ttfBuffer) {
      srcStringBuilder.push(this.getIconURLContent(FontFormat.ttf, iconBuffer.ttfBuffer))
    }
    return `${eotIE9Str}src: ${srcStringBuilder.join(',\n  ')};`
  }

  getIconURLContent (fontFormat: FontFormat, buffer: Buffer, withoutFormat?: boolean): string {
    let urlContent: string = ''
    if (this.config.inline) {
      urlContent = `url(data:${FontFormatConfig[fontFormat].contentType};base64,${buffer.toString('base64')})`
    } else {
      let iconFontfileName = `${this.config.fontName}.${FontFormatConfig[fontFormat].extensionName}`
      this.iconFontFileList[iconFontfileName] = buffer
      urlContent = `url(${iconFontfileName}?t=${new Date().getTime()})`
    }
    if (withoutFormat) {
      return urlContent
    }
    return `${urlContent} format('${FontFormatConfig[fontFormat].formatString}')`
  }

  generateSvgIcon (iconList: IconItem[]): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      const svgFontStream = new SVGIcons2SVGFontStream({
        fontName: this.config.fontName
      })
      let generateSvgIconPath = path.join(this.config.output, './__temp__svgicon__.svg')
      svgFontStream.pipe(fs.createWriteStream(generateSvgIconPath))
        .on('finish', function () {
          console.log('Font successfully created!')
          resolve(fs.readFileSync(generateSvgIconPath))
          fs.unlinkSync(generateSvgIconPath)
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

  generateEOTBuffer (ttfBuffer: Buffer) {
    const eot = ttf2eot(ttfBuffer)
    return Buffer.from(eot.buffer)
  }

  generateWoff2Buffer (ttfBuffer: Buffer) {
    const woff2 = ttf2woff2(ttfBuffer)
    return Buffer.from(woff2.buffer)
  }

  generateWoffBuffer (ttfBuffer: Buffer) {
    const woff = ttf2woff(ttfBuffer)
    return Buffer.from(woff.buffer)
  }
}

export function svgIcon2Font (initinalConfig: SVGIcon2FontConfig) {
  let svgIcon2Font = new SVGIcon2Font(initinalConfig)
  svgIcon2Font.writeFile()
}
