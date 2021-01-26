import { Processor } from 'unified';

export type RendererSettings = {
  isEnabledLinebreaks: boolean
  isEnabledLinebreaksInComments: boolean
};

export interface UnifiedConfigurer {
  (unified: Processor): Processor;
}
