import { XssOptionConfig } from '~/services/xss/xssOption';

export type RendererSettings = {
  isEnabledLinebreaks: boolean,
  isEnabledLinebreaksInComments: boolean,
  adminPreferredIndentSize: number,
  isIndentSizeForced: boolean,
};

export type GrowiHydratedEnv = {
  PLANTUML_URI: string | null,
  BLOCKDIAG_URI: string | null,
  DRAWIO_URI: string | null,
  HACKMD_URI: string | null,
  NO_CDN: string | null,
  GROWI_CLOUD_URI: string | null,
  GROWI_APP_ID_FOR_GROWI_CLOUD: string | null,
}

export type GrowiRendererConfig = {
  highlightJsStyleBorder: boolean
  env: Pick<GrowiHydratedEnv, 'PLANTUML_URI' | 'BLOCKDIAG_URI'>
} & XssOptionConfig;
