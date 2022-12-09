export const manifestPath = 'dist/themes/manifest.json';

export const getManifestKeyFromTheme = (theme: string): string => {
    return `src/styles/${theme}.scss`;
};
