import assert from 'assert';

import { isClient } from '@growi/core/dist/utils/browser-utils';
import * as refsGrowiPlugin from '@growi/remark-attachment-refs/dist/client/index.mjs';
import * as drawioPlugin from '@growi/remark-drawio';
// eslint-disable-next-line import/extensions
import * as lsxGrowiPlugin from '@growi/remark-lsx/dist/client/index.mjs';
import katex from 'rehype-katex';
import sanitize from 'rehype-sanitize';
import slug from 'rehype-slug';
import type { HtmlElementNode } from 'rehype-toc';
import breaks from 'remark-breaks';
import math from 'remark-math';
import deepmerge from 'ts-deepmerge';
import type { Pluggable } from 'unified';


import { DrawioViewerWithEditButton } from '~/components/ReactMarkdownComponents/DrawioViewerWithEditButton';
import { Header } from '~/components/ReactMarkdownComponents/Header';
import { MermaidViewer } from '~/components/ReactMarkdownComponents/MermaidViewer';
import { TableWithEditButton } from '~/components/ReactMarkdownComponents/TableWithEditButton';
import { RehypeSanitizeOption } from '~/interfaces/rehype';
import type { RendererOptions } from '~/interfaces/renderer-options';
import type { RendererConfig } from '~/interfaces/services/renderer';
import * as addLineNumberAttribute from '~/services/renderer/rehype-plugins/add-line-number-attribute';
import * as keywordHighlighter from '~/services/renderer/rehype-plugins/keyword-highlighter';
import * as relocateToc from '~/services/renderer/rehype-plugins/relocate-toc';
import * as mermaid from '~/services/renderer/remark-plugins/mermaid';
import * as plantuml from '~/services/renderer/remark-plugins/plantuml';
import * as xsvToTable from '~/services/renderer/remark-plugins/xsv-to-table';
import {
  commonSanitizeOption, generateCommonOptions, injectCustomSanitizeOption, verifySanitizePlugin,
} from '~/services/renderer/renderer';
import loggerFactory from '~/utils/logger';

// import EasyGrid from './PreProcessor/EasyGrid';

import '@growi/remark-lsx/dist/client/style.css';
import '@growi/remark-attachment-refs/dist/client/style.css';


const logger = loggerFactory('growi:cli:services:renderer');


assert(isClient(), 'This module must be loaded only from client modules.');


export const generateViewOptions = (
    pagePath: string,
    config: RendererConfig,
    storeTocNode: (toc: HtmlElementNode) => void,
): RendererOptions => {

  const options = generateCommonOptions(pagePath);

  const { remarkPlugins, rehypePlugins, components } = options;

  // add remark plugins
  remarkPlugins.push(
    math,
    [plantuml.remarkPlugin, { plantumlUri: config.plantumlUri }],
    drawioPlugin.remarkPlugin,
    xsvToTable.remarkPlugin,
    lsxGrowiPlugin.remarkPlugin,
    refsGrowiPlugin.remarkPlugin,
    mermaid.remarkPlugin,
  );
  if (config.isEnabledLinebreaks) {
    remarkPlugins.push(breaks);
  }

  if (config.xssOption === RehypeSanitizeOption.CUSTOM) {
    injectCustomSanitizeOption(config);
  }

  const rehypeSanitizePlugin: Pluggable<any[]> | (() => void) = config.isEnabledXssPrevention
    ? [sanitize, deepmerge(
      commonSanitizeOption,
      drawioPlugin.sanitizeOption,
      lsxGrowiPlugin.sanitizeOption,
      refsGrowiPlugin.sanitizeOption,
      mermaid.sanitizeOption,
    )]
    : () => {};

  // add rehype plugins
  rehypePlugins.push(
    slug,
    [lsxGrowiPlugin.rehypePlugin, { pagePath, isSharedPage: config.isSharedPage }],
    [refsGrowiPlugin.rehypePlugin, { pagePath }],
    rehypeSanitizePlugin,
    katex,
    [relocateToc.rehypePluginStore, { storeTocNode }],
  );

  // add components
  if (components != null) {
    components.h1 = Header;
    components.h2 = Header;
    components.h3 = Header;
    components.h4 = Header;
    components.h5 = Header;
    components.h6 = Header;
    components.lsx = lsxGrowiPlugin.Lsx;
    components.ref = refsGrowiPlugin.Ref;
    components.refs = refsGrowiPlugin.Refs;
    components.refimg = refsGrowiPlugin.RefImg;
    components.refsimg = refsGrowiPlugin.RefsImg;
    components.gallery = refsGrowiPlugin.Gallery;
    components.drawio = DrawioViewerWithEditButton;
    components.table = TableWithEditButton;
    components.mermaid = MermaidViewer;
  }

  if (config.isEnabledXssPrevention) {
    verifySanitizePlugin(options, false);
  }
  return options;
};

export const generateTocOptions = (config: RendererConfig, tocNode: HtmlElementNode | undefined): RendererOptions => {

  const options = generateCommonOptions(undefined);

  const { rehypePlugins } = options;

  // add remark plugins
  // remarkPlugins.push();

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
    [relocateToc.rehypePluginRestore, { tocNode }],
    rehypeSanitizePlugin,
  );

  if (config.isEnabledXssPrevention) {
    verifySanitizePlugin(options);
  }

  return options;
};

export const generateSimpleViewOptions = (
    config: RendererConfig,
    pagePath: string,
    highlightKeywords?: string | string[],
    overrideIsEnabledLinebreaks?: boolean,
): RendererOptions => {
  const options = generateCommonOptions(pagePath);

  const { remarkPlugins, rehypePlugins, components } = options;

  // add remark plugins
  remarkPlugins.push(
    math,
    [plantuml.remarkPlugin, { plantumlUri: config.plantumlUri }],
    drawioPlugin.remarkPlugin,
    xsvToTable.remarkPlugin,
    lsxGrowiPlugin.remarkPlugin,
    refsGrowiPlugin.remarkPlugin,
    mermaid.remarkPlugin,
  );

  const isEnabledLinebreaks = overrideIsEnabledLinebreaks ?? config.isEnabledLinebreaks;

  if (isEnabledLinebreaks) {
    remarkPlugins.push(breaks);
  }

  if (config.xssOption === RehypeSanitizeOption.CUSTOM) {
    injectCustomSanitizeOption(config);
  }


  const rehypeSanitizePlugin: Pluggable<any[]> | (() => void) = config.isEnabledXssPrevention
    ? [sanitize, deepmerge(
      commonSanitizeOption,
      drawioPlugin.sanitizeOption,
      lsxGrowiPlugin.sanitizeOption,
      refsGrowiPlugin.sanitizeOption,
      mermaid.sanitizeOption,
    )]
    : () => {};

  // add rehype plugins
  rehypePlugins.push(
    [lsxGrowiPlugin.rehypePlugin, { pagePath, isSharedPage: config.isSharedPage }],
    [refsGrowiPlugin.rehypePlugin, { pagePath }],
    [keywordHighlighter.rehypePlugin, { keywords: highlightKeywords }],
    rehypeSanitizePlugin,
    katex,
  );

  // add components
  if (components != null) {
    components.lsx = lsxGrowiPlugin.LsxImmutable;
    components.ref = refsGrowiPlugin.RefImmutable;
    components.refs = refsGrowiPlugin.RefsImmutable;
    components.refimg = refsGrowiPlugin.RefImgImmutable;
    components.refsimg = refsGrowiPlugin.RefsImgImmutable;
    components.gallery = refsGrowiPlugin.GalleryImmutable;
    components.drawio = drawioPlugin.DrawioViewer;
    components.mermaid = MermaidViewer;
  }

  if (config.isEnabledXssPrevention) {
    verifySanitizePlugin(options, false);
  }
  return options;
};

export const generatePresentationViewOptions = (
    config: RendererConfig,
    pagePath: string,
): RendererOptions => {
  // based on simple view options
  const options = generateSimpleViewOptions(config, pagePath);

  if (config.isEnabledXssPrevention) {
    verifySanitizePlugin(options, false);
  }
  return options;
};

export const generatePreviewOptions = (config: RendererConfig, pagePath: string): RendererOptions => {
  const options = generateCommonOptions(pagePath);

  const { remarkPlugins, rehypePlugins, components } = options;

  // add remark plugins
  remarkPlugins.push(
    math,
    [plantuml.remarkPlugin, { plantumlUri: config.plantumlUri }],
    drawioPlugin.remarkPlugin,
    xsvToTable.remarkPlugin,
    lsxGrowiPlugin.remarkPlugin,
    refsGrowiPlugin.remarkPlugin,
    mermaid.remarkPlugin,
  );
  if (config.isEnabledLinebreaks) {
    remarkPlugins.push(breaks);
  }

  if (config.xssOption === RehypeSanitizeOption.CUSTOM) {
    injectCustomSanitizeOption(config);
  }

  const rehypeSanitizePlugin: Pluggable<any[]> | (() => void) = config.isEnabledXssPrevention
    ? [sanitize, deepmerge(
      commonSanitizeOption,
      lsxGrowiPlugin.sanitizeOption,
      refsGrowiPlugin.sanitizeOption,
      drawioPlugin.sanitizeOption,
      addLineNumberAttribute.sanitizeOption,
      mermaid.sanitizeOption,
    )]
    : () => {};

  // add rehype plugins
  rehypePlugins.push(
    [lsxGrowiPlugin.rehypePlugin, { pagePath, isSharedPage: config.isSharedPage }],
    [refsGrowiPlugin.rehypePlugin, { pagePath }],
    addLineNumberAttribute.rehypePlugin,
    rehypeSanitizePlugin,
    katex,
  );

  // add components
  if (components != null) {
    components.lsx = lsxGrowiPlugin.LsxImmutable;
    components.ref = refsGrowiPlugin.RefImmutable;
    components.refs = refsGrowiPlugin.RefsImmutable;
    components.refimg = refsGrowiPlugin.RefImgImmutable;
    components.refsimg = refsGrowiPlugin.RefsImgImmutable;
    components.gallery = refsGrowiPlugin.GalleryImmutable;
    components.drawio = drawioPlugin.DrawioViewer;
    components.mermaid = MermaidViewer;
  }

  if (config.isEnabledXssPrevention) {
    verifySanitizePlugin(options, false);
  }
  return options;
};
