/*!
 * SVGIcon2Font v1.0.1
 * (c) 2019-2019 Zhongqc
 * Released under the MIT License.
 */
'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var fs = _interopDefault(require('fs'));
var path$1 = _interopDefault(require('path'));
var SVGIcons2SVGFontStream = _interopDefault(require('svgicons2svgfont'));
var svg2ttf = _interopDefault(require('svg2ttf'));
var ttf2eot = _interopDefault(require('ttf2eot'));
var ttf2woff = _interopDefault(require('ttf2woff'));
var ttf2woff2 = _interopDefault(require('ttf2woff2'));

const path = require('path');
var FontFormat;
(function (FontFormat) {
    FontFormat["eot"] = "eot";
    FontFormat["woff2"] = "woff2";
    FontFormat["woff"] = "woff";
    FontFormat["ttf"] = "ttf";
})(FontFormat || (FontFormat = {}));
const FontFormatConfig = {
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
};
const defaultConfig = {
    entry: path.join(__dirname, '../icons'),
    output: path.join(__dirname, '../css'),
    iconCssFileName: 'icon.css',
    fontName: 'iconfont',
    iconPrefix: '',
    inline: true,
    formats: [FontFormat.ttf],
    startUnicode: 0xea01,
};
function buildConfig(config) {
    return Object.assign({}, defaultConfig, config);
}

const iconRegexp = /(.svg)$/;
class SVGIcon2Font {
    constructor(initinalConfig) {
        this.iconFontFileList = {};
        const config = buildConfig(initinalConfig);
        this.config = config;
        this.iconList = this.getIconList();
        this.mkOutputDir();
    }
    getIconList() {
        return fs.readdirSync(this.config.entry).filter((fileName) => iconRegexp.test(fileName)).map((fileName, i) => {
            let iconCode = this.config.startUnicode + i;
            return {
                name: fileName.replace(iconRegexp, ''),
                path: path$1.join(this.config.entry, fileName),
                unicode: [String.fromCharCode(iconCode)],
                hexCode: `\\${iconCode.toString(16)}`
            };
        });
    }
    mkOutputDir() {
        if (!fs.existsSync(this.config.output)) {
            fs.mkdirSync(this.config.output);
        }
    }
    async writeFile() {
        let iconBuffer = await this.generateIconBuffer();
        fs.writeFileSync(path$1.join(this.config.output, this.config.iconCssFileName), this.generateIconFontFace(iconBuffer).concat('\n\n', this.generateIconListCssStr(this.iconList), '\n'));
        for (let fileName in this.iconFontFileList) {
            fs.writeFileSync(path$1.join(this.config.output, fileName), this.iconFontFileList[fileName]);
        }
    }
    async generateIconBuffer() {
        let fontFormats = this.config.formats;
        let svgIconBuffer = await this.generateSvgIcon(this.iconList);
        let ttfBuffer = this.generateTTFBuffer(svgIconBuffer);
        let iconBuffer = {
            ttfBuffer: fontFormats.includes(FontFormat.ttf) ? ttfBuffer : undefined,
            eotBuffer: fontFormats.includes(FontFormat.eot) ? this.generateEOTBuffer(ttfBuffer) : undefined,
            woffBuffer: fontFormats.includes(FontFormat.woff) ? this.generateWoffBuffer(ttfBuffer) : undefined,
            woff2Buffer: fontFormats.includes(FontFormat.woff2) ? this.generateWoff2Buffer(ttfBuffer) : undefined
        };
        return iconBuffer;
    }
    generateIconFontFace(iconBuffer) {
        let fontName = this.config.fontName;
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
}`;
    }
    generateIconListCssStr(iconList) {
        let iconPrefix = this.config.iconPrefix ? `${this.config.iconPrefix}-` : '';
        return iconList.map((icon) => {
            return `.${iconPrefix}${icon.name}::before {
  content: "${icon.hexCode}";
}`;
        }).join('\n\n');
    }
    generateIconFontContent(iconBuffer) {
        let srcStringBuilder = [];
        let eotIE9Str = '';
        if (iconBuffer.eotBuffer) {
            eotIE9Str = `src: ${this.getIconURLContent(FontFormat.eot, iconBuffer.eotBuffer, true)} /* IE9 */;
  `;
            srcStringBuilder.push(this.getIconURLContent(FontFormat.eot, iconBuffer.eotBuffer));
        }
        if (iconBuffer.woff2Buffer) {
            srcStringBuilder.push(this.getIconURLContent(FontFormat.woff2, iconBuffer.woff2Buffer));
        }
        if (iconBuffer.woffBuffer) {
            srcStringBuilder.push(this.getIconURLContent(FontFormat.woff, iconBuffer.woffBuffer));
        }
        if (iconBuffer.ttfBuffer) {
            srcStringBuilder.push(this.getIconURLContent(FontFormat.ttf, iconBuffer.ttfBuffer));
        }
        return `${eotIE9Str}src: ${srcStringBuilder.join(',\n  ')};`;
    }
    getIconURLContent(fontFormat, buffer, withoutFormat) {
        let urlContent = '';
        if (this.config.inline) {
            urlContent = `url(data:${FontFormatConfig[fontFormat].contentType};base64,${buffer.toString('base64')})`;
        }
        else {
            let iconFontfileName = `${this.config.fontName}.${FontFormatConfig[fontFormat].extensionName}`;
            this.iconFontFileList[iconFontfileName] = buffer;
            urlContent = `url(${iconFontfileName}?t=${new Date().getTime()})`;
        }
        if (withoutFormat) {
            return urlContent;
        }
        return `${urlContent} format('${FontFormatConfig[fontFormat].formatString}')`;
    }
    generateSvgIcon(iconList) {
        return new Promise((resolve, reject) => {
            const svgFontStream = new SVGIcons2SVGFontStream({
                fontName: this.config.fontName
            });
            let generateSvgIconPath = path$1.join(this.config.output, './__temp__svgicon__.svg');
            svgFontStream.pipe(fs.createWriteStream(generateSvgIconPath))
                .on('finish', function () {
                console.log('Font successfully created!');
                resolve(fs.readFileSync(generateSvgIconPath));
                fs.unlinkSync(generateSvgIconPath);
            })
                .on('error', function (err) {
                console.log(err);
                reject(err);
            });
            iconList.forEach((icon) => {
                const glyph = fs.createReadStream(icon.path);
                glyph.metadata = {
                    name: icon.name,
                    unicode: icon.unicode
                };
                svgFontStream.write(glyph);
            });
            svgFontStream.end();
        });
    }
    generateTTFBuffer(svgIcon) {
        const ttf = svg2ttf(svgIcon.toString('utf8'), {});
        return Buffer.from(ttf.buffer);
    }
    generateEOTBuffer(ttfBuffer) {
        const eot = ttf2eot(ttfBuffer);
        return Buffer.from(eot.buffer);
    }
    generateWoff2Buffer(ttfBuffer) {
        const woff2 = ttf2woff2(ttfBuffer);
        return Buffer.from(woff2.buffer);
    }
    generateWoffBuffer(ttfBuffer) {
        const woff = ttf2woff(ttfBuffer);
        return Buffer.from(woff.buffer);
    }
}
function svgIcon2Font(initinalConfig) {
    let svgIcon2Font = new SVGIcon2Font(initinalConfig);
    svgIcon2Font.writeFile();
}

exports.svgIcon2Font = svgIcon2Font;
//# sourceMappingURL=index.js.map
