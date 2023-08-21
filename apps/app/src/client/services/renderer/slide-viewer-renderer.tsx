import * as refsGrowiDirective from '@growi/remark-attachment-refs/dist/client';
import * as drawio from '@growi/remark-drawio';
// eslint-disable-next-line import/extensions
import * as lsxGrowiDirective from '@growi/remark-lsx/dist/client';
import katex from 'rehype-katex';
import sanitize from 'rehype-sanitize';
import math from 'remark-math';
import deepmerge from 'ts-deepmerge';
import type { Pluggable } from 'unified';

import { LightBox } from '~/components/ReactMarkdownComponents/LightBox';
import { RichAttachment } from '~/components/ReactMarkdownComponents/RichAttachment';
import * as mermaid from '~/features/mermaid';
import { RehypeSanitizeOption } from '~/interfaces/rehype';
import type { RendererOptions } from '~/interfaces/renderer-options';
import type { RendererConfig } from '~/interfaces/services/renderer';
import * as attachment from '~/services/renderer/remark-plugins/attachment';
import * as plantuml from '~/services/renderer/remark-plugins/plantuml';
import * as xsvToTable from '~/services/renderer/remark-plugins/xsv-to-table';
import {
  commonSanitizeOption, generateCommonOptions, injectCustomSanitizeOption, verifySanitizePlugin,
} from '~/services/renderer/renderer';


export const generatePresentationViewOptions = (
    config: RendererConfig,
    pagePath: string,
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
