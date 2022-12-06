import { ITemplate } from './template';

export type GrowiFacade = {
  markdownRenderer?: {
    optionsGenerators?: {
      generateViewOptions?: any;
      customGenerateViewOptions?: any;
      generatePreviewOptions?: any;
      customGeneratePreviewOptions?: any;
    },
    optionsMutators?: any,
  },
  customTemplates?: {
    [pluginName: string]: ITemplate,
  }
};
