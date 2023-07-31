

import * as refsGrowiDirective from '@growi/remark-attachment-refs/dist/client/index.mjs';
import * as drawio from '@growi/remark-drawio';
// eslint-disable-next-line import/extensions
import * as lsxGrowiDirective from '@growi/remark-lsx/dist/client/index.mjs';
import katex from 'rehype-katex';
import sanitize from 'rehype-sanitize';
import breaks from 'remark-breaks';
import math from 'remark-math';
import useSWR, { type SWRResponse } from 'swr';
import deepmerge from 'ts-deepmerge';
import type { Pluggable } from 'unified';

import { LightBox } from '~/components/ReactMarkdownComponents/LightBox';
import { RichAttachment } from '~/components/ReactMarkdownComponents/RichAttachment';
import * as mermaid from '~/features/mermaid';
import { RehypeSanitizeOption } from '~/interfaces/rehype';
import type { RendererOptions } from '~/interfaces/renderer-options';
import type { RendererConfig } from '~/interfaces/services/renderer';
import * as keywordHighlighter from '~/services/renderer/rehype-plugins/keyword-highlighter';
import * as attachment from '~/services/renderer/remark-plugins/attachment';
import * as plantuml from '~/services/renderer/remark-plugins/plantuml';
import * as xsvToTable from '~/services/renderer/remark-plugins/xsv-to-table';
import {
  commonSanitizeOption, generateCommonOptions, injectCustomSanitizeOption, verifySanitizePlugin,
} from '~/services/renderer/renderer';
import { useRendererConfig } from '~/stores/context';
import { useCurrentPagePath } from '~/stores/page';

const generateSimpleViewOptions = (
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

const generatePresentationViewOptions = (
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

export const usePresentationViewOptions = (): SWRResponse<RendererOptions, Error> => {
  const { data: currentPagePath } = useCurrentPagePath();
  const { data: rendererConfig } = useRendererConfig();

  const isAllDataValid = currentPagePath != null && rendererConfig != null;

  return useSWR(
    isAllDataValid
      ? ['presentationViewOptions', currentPagePath, rendererConfig]
      : null,
    async([, currentPagePath, rendererConfig]) => {
      return generatePresentationViewOptions(rendererConfig, currentPagePath);
    },
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
    },
  );
};
