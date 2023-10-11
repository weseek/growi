import katex from 'rehype-katex';
import sanitize from 'rehype-sanitize';
import breaks from 'remark-breaks';
import math from 'remark-math';
import deepmerge from 'ts-deepmerge';
import type { Pluggable } from 'unified';

import { RehypeSanitizeOption } from '~/interfaces/rehype';
import type { RendererOptions } from '~/interfaces/renderer-options';
import type { RendererConfig } from '~/interfaces/services/renderer';

import * as xsvToTable from './remark-plugins/xsv-to-table';
import {
  commonSanitizeOption, generateCommonOptions, injectCustomSanitizeOption, verifySanitizePlugin,
} from './renderer';

export const generateCmsRenderingOptions = (
    config: RendererConfig,
    pagePath: string,
): RendererOptions => {
  const options = generateCommonOptions(pagePath);

  const { remarkPlugins, rehypePlugins } = options;

  // add remark plugins
  remarkPlugins.push(
    math,
    xsvToTable.remarkPlugin,
  );

  const isEnabledLinebreaks = config.isEnabledLinebreaks;

  if (isEnabledLinebreaks) {
    remarkPlugins.push(breaks);
  }

  if (config.xssOption === RehypeSanitizeOption.CUSTOM) {
    injectCustomSanitizeOption(config);
  }

  const rehypeSanitizePlugin: Pluggable<any[]> | (() => void) = config.isEnabledXssPrevention
    ? [sanitize, deepmerge(
      commonSanitizeOption,
    )]
    : () => {};

  // add rehype plugins
  rehypePlugins.push(
    rehypeSanitizePlugin,
    katex,
  );

  // add components
  // if (components != null) {
  // }

  if (config.isEnabledXssPrevention) {
    verifySanitizePlugin(options, false);
  }
  return options;
};
