import { XssOptionConfig } from '~/services/xss/xssOption';

export type RendererConfig = {
  isSharedPage?: boolean
  isEnabledLinebreaks: boolean,
  isEnabledLinebreaksInComments: boolean,
  adminPreferredIndentSize: number,
  isIndentSizeForced: boolean,
  highlightJsStyleBorder: boolean,

  drawioUri: string,
  plantumlUri: string,
} & XssOptionConfig;
