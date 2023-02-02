import { XssOptionConfig } from '~/services/xss/xssOption';

export type RendererConfig = {
  isSharedPage?: boolean
  isEnabledLinebreaks: boolean,
  isEnabledLinebreaksInComments: boolean,
  adminPreferredIndentSize: number,
  isIndentSizeForced: boolean,
  highlightJsStyleBorder: boolean,

  plantumlUri: string | null,
  blockdiagUri: string | null,
} & XssOptionConfig;
