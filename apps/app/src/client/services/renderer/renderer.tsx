import assert from 'assert';

import { isClient } from '@growi/core/dist/utils/browser-utils';
import * as slides from '@growi/presentation';
import * as refsGrowiDirective from '@growi/remark-attachment-refs/dist/client/index.mjs';
import * as drawio from '@growi/remark-drawio';
// eslint-disable-next-line import/extensions
import * as lsxGrowiDirective from '@growi/remark-lsx/dist/client/index.mjs';
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
import { LightBox } from '~/components/ReactMarkdownComponents/LightBox';
import { RichAttachment } from '~/components/ReactMarkdownComponents/RichAttachment';
// eslint-disable-next-line import/no-cycle
import { SlideViewer } from '~/components/ReactMarkdownComponents/SlideViewer';
import { TableWithEditButton } from '~/components/ReactMarkdownComponents/TableWithEditButton';
import * as mermaid from '~/features/mermaid';
import { RehypeSanitizeOption } from '~/interfaces/rehype';
import type { RendererOptions } from '~/interfaces/renderer-options';
import type { RendererConfig } from '~/interfaces/services/renderer';
import * as addLineNumberAttribute from '~/services/renderer/rehype-plugins/add-line-number-attribute';
import * as keywordHighlighter from '~/services/renderer/rehype-plugins/keyword-highlighter';
import * as relocateToc from '~/services/renderer/rehype-plugins/relocate-toc';
import * as attachment from '~/services/renderer/remark-plugins/attachment';
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
    drawio.remarkPlugin,
    mermaid.remarkPlugin,
    xsvToTable.remarkPlugin,
    attachment.remarkPlugin,
    slides.remarkPlugin,
    lsxGrowiDirective.remarkPlugin,
    refsGrowiDirective.remarkPlugin,
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
      drawio.sanitizeOption,
      mermaid.sanitizeOption,
      attachment.sanitizeOption,
      slides.sanitizeOption,
      lsxGrowiDirective.sanitizeOption,
      refsGrowiDirective.sanitizeOption,
    )]
    : () => {};

  // add rehype plugins
  rehypePlugins.push(
    slug,
    [lsxGrowiDirective.rehypePlugin, { pagePath, isSharedPage: config.isSharedPage }],
    [refsGrowiDirective.rehypePlugin, { pagePath }],
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
    components.lsx = lsxGrowiDirective.Lsx;
    components.ref = refsGrowiDirective.Ref;
    components.refs = refsGrowiDirective.Refs;
    components.refimg = refsGrowiDirective.RefImg;
    components.refsimg = refsGrowiDirective.RefsImg;
    components.gallery = refsGrowiDirective.Gallery;
    components.drawio = DrawioViewerWithEditButton;
    components.table = TableWithEditButton;
    components.mermaid = mermaid.MermaidViewer;
    components.attachment = RichAttachment;
    components.img = LightBox;
    components.slide = SlideViewer;
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
    drawio.remarkPlugin,
    mermaid.remarkPlugin,
    xsvToTable.remarkPlugin,
    attachment.remarkPlugin,
    lsxGrowiDirective.remarkPlugin,
    refsGrowiDirective.remarkPlugin,
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
      drawio.sanitizeOption,
      mermaid.sanitizeOption,
      attachment.sanitizeOption,
      lsxGrowiDirective.sanitizeOption,
      refsGrowiDirective.sanitizeOption,
    )]
    : () => {};

  // add rehype plugins
  rehypePlugins.push(
    [lsxGrowiDirective.rehypePlugin, { pagePath, isSharedPage: config.isSharedPage }],
    [refsGrowiDirective.rehypePlugin, { pagePath }],
    [keywordHighlighter.rehypePlugin, { keywords: highlightKeywords }],
    rehypeSanitizePlugin,
    katex,
  );

  // add components
  if (components != null) {
    components.lsx = lsxGrowiDirective.LsxImmutable;
    components.ref = refsGrowiDirective.RefImmutable;
    components.refs = refsGrowiDirective.RefsImmutable;
    components.refimg = refsGrowiDirective.RefImgImmutable;
    components.refsimg = refsGrowiDirective.RefsImgImmutable;
    components.gallery = refsGrowiDirective.GalleryImmutable;
    components.drawio = drawio.DrawioViewer;
    components.mermaid = mermaid.MermaidViewer;
    components.attachment = RichAttachment;
    components.img = LightBox;
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
    drawio.remarkPlugin,
    mermaid.remarkPlugin,
    xsvToTable.remarkPlugin,
    attachment.remarkPlugin,
    lsxGrowiDirective.remarkPlugin,
    refsGrowiDirective.remarkPlugin,
    slides.remarkPlugin,
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
      drawio.sanitizeOption,
      mermaid.sanitizeOption,
      attachment.sanitizeOption,
      lsxGrowiDirective.sanitizeOption,
      refsGrowiDirective.sanitizeOption,
      addLineNumberAttribute.sanitizeOption,
      slides.sanitizeOption,
    )]
    : () => {};

  // add rehype plugins
  rehypePlugins.push(
    [lsxGrowiDirective.rehypePlugin, { pagePath, isSharedPage: config.isSharedPage }],
    [refsGrowiDirective.rehypePlugin, { pagePath }],
    addLineNumberAttribute.rehypePlugin,
    rehypeSanitizePlugin,
    katex,
  );

  // add components
  if (components != null) {
    components.lsx = lsxGrowiDirective.LsxImmutable;
    components.ref = refsGrowiDirective.RefImmutable;
    components.refs = refsGrowiDirective.RefsImmutable;
    components.refimg = refsGrowiDirective.RefImgImmutable;
    components.refsimg = refsGrowiDirective.RefsImgImmutable;
    components.gallery = refsGrowiDirective.GalleryImmutable;
    components.drawio = drawio.DrawioViewer;
    components.mermaid = mermaid.MermaidViewer;
    components.attachment = RichAttachment;
    components.img = LightBox;
    components.slide = SlideViewer;
  }

  if (config.isEnabledXssPrevention) {
    verifySanitizePlugin(options, false);
  }
  return options;
};
