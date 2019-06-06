export declare enum FontFormat {
    eot = "eot",
    woff2 = "woff2",
    woff = "woff",
    ttf = "ttf"
}
export declare const FontFormatConfig: {
    [key: string]: {
        contentType: string;
        extensionName: string;
        formatString: string;
    };
};
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
export declare function buildConfig(config: SVGIcon2FontConfig): SVGIcon2FontConfig;
