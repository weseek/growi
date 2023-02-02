import { XssOptionConfig } from '~/services/xss/xssOption';

export type RendererConfig = {
  isLsxDisabled?: boolean, // for shared page
  isEnabledLinebreaks: boolean,
  isEnabledLinebreaksInComments: boolean,
  adminPreferredIndentSize: number,
  isIndentSizeForced: boolean,
  highlightJsStyleBorder: boolean,

  plantumlUri: string | null,
  blockdiagUri: string | null,
} & XssOptionConfig;
