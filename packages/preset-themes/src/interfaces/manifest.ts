export type PresetThemesManifest = {
  [key: string]: {
    file: string,
    src: string,
    isEntry?: boolean,
  }
}
