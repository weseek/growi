import { XssOptionConfig } from '~/services/xss/xssOption';

// export type GrowiHydratedEnv = {
//   DRAWIO_URI: string | null,
//   HACKMD_URI: string | null,
//   NO_CDN: string | null,
//   GROWI_CLOUD_URI: string | null,
//   GROWI_APP_ID_FOR_GROWI_CLOUD: string | null,
// }

export type RendererConfig = {
  isEnabledLinebreaks: boolean,
  isEnabledLinebreaksInComments: boolean,
  adminPreferredIndentSize: number,
  isIndentSizeForced: boolean,
  highlightJsStyleBorder: boolean

  plantumlUri: string | null,
  blockdiagUri: string | null,
} & XssOptionConfig;
