import type { RehypeSanitizeConfiguration } from './rehype-sanitize';
import { defaultRehypeSanitizeConfig } from './rehype-sanitize';

export type RendererConfig = {
  isSharedPage?: boolean
  isEnabledLinebreaks: boolean,
  isEnabledLinebreaksInComments: boolean,
  adminPreferredIndentSize: number,
  isIndentSizeForced: boolean,
  highlightJsStyleBorder: boolean,
  isEnabledMarp: boolean,

  drawioUri: string,
  plantumlUri: string,
} & RehypeSanitizeConfiguration;

export const defaultRendererConfig: RendererConfig = {
  isSharedPage: false,
  isEnabledLinebreaks: false,
  isEnabledLinebreaksInComments: true,
  adminPreferredIndentSize: 4,
  isIndentSizeForced: false,
  highlightJsStyleBorder: false,
  isEnabledMarp: false,

  drawioUri: 'https://embed.diagrams.net/',
  plantumlUri: 'https://www.plantuml.com/plantuml',

  ...defaultRehypeSanitizeConfig,
};
