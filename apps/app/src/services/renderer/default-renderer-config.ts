import type { RendererConfig } from '~/interfaces/services/renderer';

export const DEFAULT_RENDERER_CONFIG: RendererConfig = {
  isEnabledLinebreaks: false,
  isEnabledLinebreaksInComments: true,
  adminPreferredIndentSize: 4,
  isIndentSizeForced: false,
  highlightJsStyleBorder: false,
  isEnabledMarp: false,

  drawioUri: 'https://embed.diagrams.net/',
  plantumlUri: 'https://www.plantuml.com/plantuml',

  isEnabledXssPrevention: true,
  sanitizeType: 'Recommended',
  customTagWhitelist: [],
  customAttrWhitelist: {},
};
