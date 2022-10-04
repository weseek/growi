import { XssOptionConfig } from '~/services/xss/xssOption';


export type RendererConfig = {
  isEnabledLinebreaks: boolean,
  isEnabledLinebreaksInComments: boolean,
  adminPreferredIndentSize: number,
  isIndentSizeForced: boolean,
  highlightJsStyleBorder: boolean,

  plantumlUri: string | null,
  blockdiagUri: string | null,
} & XssOptionConfig;
