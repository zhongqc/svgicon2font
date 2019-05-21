declare enum FontFormat {
    ttf = "ttf",
    svg = "svg",
    eot = "eot",
    woff = "woff",
    woff2 = "woff2"
}
export interface SVGIcon2FontConfig {
    entry: string;
    output: string;
    iconCssFileName?: string;
    fontName: string;
    iconPrefix?: string;
    inline?: boolean;
    formats?: FontFormat[];
    startUnicode?: number;
}
export default function (config: SVGIcon2FontConfig): SVGIcon2FontConfig;
export {};
