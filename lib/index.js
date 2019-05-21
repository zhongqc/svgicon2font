/*!
 * SVGIcon2Font v0.0.1
 * (c) 2019-2019 Zhongqc
 * Released under the MIT License.
 */
'use strict';

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var fs = _interopDefault(require('fs'));
var path$1 = _interopDefault(require('path'));
var SVGIcons2SVGFontStream = _interopDefault(require('svgicons2svgfont'));
var svg2ttf = _interopDefault(require('svg2ttf'));

const path = require('path');
var FontFormat;
(function (FontFormat) {
    FontFormat["ttf"] = "ttf";
    FontFormat["svg"] = "svg";
    FontFormat["eot"] = "eot";
    FontFormat["woff"] = "woff";
    FontFormat["woff2"] = "woff2";
})(FontFormat || (FontFormat = {}));
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
function buildConfig (config) {
    return Object.assign({}, config, defaultConfig);
}

const iconRegexp = /(.svg)$/;
class SVGIcon2Font {
    constructor(initinalConfig) {
        const config = buildConfig(initinalConfig);
        this.config = config;
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
    generateIconFontFace(svgIconBuffer) {
        let fontName = this.config.fontName;
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
}`;
    }
    generateSvgIcon(iconList) {
        return new Promise((resolve, reject) => {
            const svgFontStream = new SVGIcons2SVGFontStream({
                fontName: this.config.fontName
            });
            let generateSvgIconPath = path$1.join(__filename, '../svgicon.svg');
            svgFontStream.pipe(fs.createWriteStream(generateSvgIconPath))
                .on('finish', function () {
                console.log('Font successfully created!');
                resolve(fs.readFileSync(generateSvgIconPath));
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
    generateIconListCssStr(iconList) {
        let iconPrefix = this.config.iconPrefix ? `${this.config.iconPrefix}-` : '';
        return iconList.map((icon) => {
            return `.${iconPrefix}${icon.name}::before {
  content: "${icon.hexCode}";
}`;
        }).join('\n\n');
    }
    writeCssFile(fontFace, fontListCss) {
        if (!fs.existsSync(this.config.output)) {
            fs.mkdirSync(this.config.output);
        }
        fs.writeFileSync(path$1.join(this.config.output, this.config.iconCssFileName), fontFace.concat('\n\n', fontListCss));
    }
}
function index (initinalConfig) {
    let svgIcon2Font = new SVGIcon2Font(initinalConfig);
    let iconList = svgIcon2Font.getIconList();
    svgIcon2Font.generateSvgIcon(iconList).then((svgIconBuffer) => {
        let fontFace = svgIcon2Font.generateIconFontFace(svgIconBuffer);
        let fontList = svgIcon2Font.generateIconListCssStr(iconList);
        console.log(fontFace, fontList);
        svgIcon2Font.writeCssFile(fontFace, fontList);
    });
}

module.exports = index;
//# sourceMappingURL=index.js.map
