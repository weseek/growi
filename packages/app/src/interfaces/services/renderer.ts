import { HtmlElementNode } from 'rehype-toc';

import { XssOptionConfig } from '~/services/xss/xssOption';

export type RendererSettings = {
  isEnabledLinebreaks: boolean,
  isEnabledLinebreaksInComments: boolean,
  adminPreferredIndentSize: number,
  isIndentSizeForced: boolean,
  mutatePageTocNode?: (node: HtmlElementNode) => void,
};

// export type GrowiHydratedEnv = {
//   DRAWIO_URI: string | null,
//   HACKMD_URI: string | null,
//   NO_CDN: string | null,
//   GROWI_CLOUD_URI: string | null,
//   GROWI_APP_ID_FOR_GROWI_CLOUD: string | null,
// }

export type GrowiRendererConfig = {
  highlightJsStyleBorder: boolean
  plantumlUri: string | null,
  blockdiagUri: string | null,
} & XssOptionConfig;
