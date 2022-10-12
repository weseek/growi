const IHighlightJsCssSelectorThemes = {
  GITHUB: 'github',
  GITHUB_GIST: 'github-gist',
  ATOM_ONE_LIGHT: 'atom-one-light',
  XCIDE: 'xcode',
  VS: 'vs',
  ATOM_ONE_DARK: 'atom-one-dark',
  HYBRID: 'hybrid',
  MONOKAI: 'monokai',
  TOMMORROW_NIGHT: 'tomorrow-night',
  VS_2015: 'vs2015',
} as const;

type IHighlightJsCssSelectorThemes = typeof IHighlightJsCssSelectorThemes[keyof typeof IHighlightJsCssSelectorThemes];

export type IHighlightJsCssSelectorOptions = {
  [theme in IHighlightJsCssSelectorThemes]: {
    name: string,
    border: boolean
  }
}

export type IResLayoutSetting = {
  isContainerFluid: boolean,
};
