export type ViteManifestValue = {
  file: string,
  src: string,
  isEntry?: boolean,
}

export type ViteManifest = {
  [key: string]: ViteManifestValue,
}
