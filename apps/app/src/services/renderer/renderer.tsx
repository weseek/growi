import growiDirective from '@growi/remark-growi-directive';
import type { Schema as SanitizeOption } from 'hast-util-sanitize';
import katex from 'rehype-katex';
import raw from 'rehype-raw';
import sanitize, { defaultSchema as rehypeSanitizeDefaultSchema } from 'rehype-sanitize';
import slug from 'rehype-slug';
import breaks from 'remark-breaks';
import emoji from 'remark-emoji';
import remarkFrontmatter from 'remark-frontmatter';
import gfm from 'remark-gfm';
import math from 'remark-math';
import toc from 'remark-toc';
import deepmerge from 'ts-deepmerge';
import type { Pluggable, PluginTuple } from 'unified';


import { CodeBlock } from '~/components/ReactMarkdownComponents/CodeBlock';
import { NextLink } from '~/components/ReactMarkdownComponents/NextLink';
import { RehypeSanitizeOption } from '~/interfaces/rehype';
import type { RendererOptions } from '~/interfaces/renderer-options';
import type { RendererConfig } from '~/interfaces/services/renderer';
import loggerFactory from '~/utils/logger';

import * as addClass from './rehype-plugins/add-class';
import { relativeLinks } from './rehype-plugins/relative-links';
import { relativeLinksByPukiwikiLikeLinker } from './rehype-plugins/relative-links-by-pukiwiki-like-linker';
import { pukiwikiLikeLinker } from './remark-plugins/pukiwiki-like-linker';
import * as xsvToTable from './remark-plugins/xsv-to-table';

// import EasyGrid from './PreProcessor/EasyGrid';


// eslint-disable-next-line @typescript-eslint/no-unused-vars
const logger = loggerFactory('growi:services:renderer');


type SanitizePlugin = PluginTuple<[SanitizeOption]>;

const baseSanitizeSchema = {
  tagNames: ['iframe', 'section', 'video'],
  attributes: {
    iframe: ['allow', 'referrerpolicy', 'sandbox', 'src', 'srcdoc'],
    video: ['controls', 'src', 'muted', 'preload', 'width', 'height', 'autoplay'],
    // The special value 'data*' as a property name can be used to allow all data properties.
    // see: https://github.com/syntax-tree/hast-util-sanitize/
    '*': ['key', 'class', 'className', 'style', 'data*'],
  },
};

export const commonSanitizeOption: SanitizeOption = deepmerge(
  rehypeSanitizeDefaultSchema,
  baseSanitizeSchema,
  {
    clobberPrefix: '', // remove clobber prefix
  },
);

let isInjectedCustomSanitaizeOption = false;

export const injectCustomSanitizeOption = (config: RendererConfig): void => {
  if (!isInjectedCustomSanitaizeOption && config.isEnabledXssPrevention && config.xssOption === RehypeSanitizeOption.CUSTOM) {
    commonSanitizeOption.tagNames = baseSanitizeSchema.tagNames.concat(config.tagWhitelist ?? []);
    commonSanitizeOption.attributes = deepmerge(baseSanitizeSchema.attributes, config.attrWhitelist ?? {});
    isInjectedCustomSanitaizeOption = true;
  }
};

const isSanitizePlugin = (pluggable: Pluggable): pluggable is SanitizePlugin => {
  if (!Array.isArray(pluggable) || pluggable.length < 2) {
    return false;
  }
  const sanitizeOption = pluggable[1];
  return 'tagNames' in sanitizeOption && 'attributes' in sanitizeOption;
};

const hasSanitizePlugin = (options: RendererOptions, shouldBeTheLastItem: boolean): boolean => {
  const { rehypePlugins } = options;
  if (rehypePlugins == null || rehypePlugins.length === 0) {
    return false;
  }

  return shouldBeTheLastItem
    ? isSanitizePlugin(rehypePlugins.slice(-1)[0]) // evaluate the last one
    : rehypePlugins.some(rehypePlugin => isSanitizePlugin(rehypePlugin));
};

export const verifySanitizePlugin = (options: RendererOptions, shouldBeTheLastItem = true): void => {
  if (hasSanitizePlugin(options, shouldBeTheLastItem)) {
    return;
  }

  throw new Error('The specified options does not have sanitize plugin in \'rehypePlugins\'');
};

export const generateCommonOptions = (pagePath: string|undefined): RendererOptions => {
  return {
    remarkPlugins: [
      [toc, { maxDepth: 3, tight: true }],
      gfm,
      emoji,
      pukiwikiLikeLinker,
      growiDirective,
      remarkFrontmatter,
    ],
    remarkRehypeOptions: {
      clobberPrefix: '', // remove clobber prefix
      allowDangerousHtml: true,
    },
    rehypePlugins: [
      [relativeLinksByPukiwikiLikeLinker, { pagePath }],
      [relativeLinks, { pagePath }],
      raw,
      [addClass.rehypePlugin, {
        table: 'table table-bordered',
      }],
    ],
    components: {
      a: NextLink,
      code: CodeBlock,
    },
  };
};


export const generateSSRViewOptions = (
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
    slug,
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
