// allow only types to import from react
import { ComponentType } from 'react';

import { Lsx } from '@growi/plugin-lsx/components';
import * as lsxGrowiPlugin from '@growi/plugin-lsx/services/renderer';
import growiPlugin from '@growi/remark-growi-plugin';
import { Schema as SanitizeOption } from 'hast-util-sanitize';
import { SpecialComponents } from 'react-markdown/lib/ast-to-react';
import { NormalComponents } from 'react-markdown/lib/complex-types';
import { ReactMarkdownOptions } from 'react-markdown/lib/react-markdown';
import katex from 'rehype-katex';
import raw from 'rehype-raw';
import sanitize, { defaultSchema as sanitizeDefaultSchema } from 'rehype-sanitize';
import slug from 'rehype-slug';
import { HtmlElementNode } from 'rehype-toc';
import breaks from 'remark-breaks';
import emoji from 'remark-emoji';
import gfm from 'remark-gfm';
import math from 'remark-math';
import deepmerge from 'ts-deepmerge';
import { PluggableList, Pluggable, PluginTuple } from 'unified';


import { CodeBlock } from '~/components/ReactMarkdownComponents/CodeBlock';
import { Header } from '~/components/ReactMarkdownComponents/Header';
import { NextLink } from '~/components/ReactMarkdownComponents/NextLink';
import { RendererConfig } from '~/interfaces/services/renderer';
import loggerFactory from '~/utils/logger';

import * as addClass from './rehype-plugins/add-class';
import * as addLineNumberAttribute from './rehype-plugins/add-line-number-attribute';
import * as keywordHighlighter from './rehype-plugins/keyword-highlighter';
import { relativeLinks } from './rehype-plugins/relative-links';
import { relativeLinksByPukiwikiLikeLinker } from './rehype-plugins/relative-links-by-pukiwiki-like-linker';
import * as toc from './rehype-plugins/relocate-toc';
import * as plantuml from './remark-plugins/plantuml';
import { pukiwikiLikeLinker } from './remark-plugins/pukiwiki-like-linker';
import * as xsvToTable from './remark-plugins/xsv-to-table';

// import CsvToTable from './PreProcessor/CsvToTable';
// import EasyGrid from './PreProcessor/EasyGrid';
// import Linker from './PreProcessor/Linker';
// import XssFilter from './PreProcessor/XssFilter';
// import BlockdiagConfigurer from './markdown-it/blockdiag';
// import DrawioViewerConfigurer from './markdown-it/drawio-viewer';
// import EmojiConfigurer from './markdown-it/emoji';
// import FooternoteConfigurer from './markdown-it/footernote';
// import HeaderConfigurer from './markdown-it/header';
// import HeaderLineNumberConfigurer from './markdown-it/header-line-number';
// import HeaderWithEditLinkConfigurer from './markdown-it/header-with-edit-link';
// import LinkerByRelativePathConfigurer from './markdown-it/link-by-relative-path';
// import MathJaxConfigurer from './markdown-it/mathjax';
// import PlantUMLConfigurer from './markdown-it/plantuml';
// import TableConfigurer from './markdown-it/table';
// import TableWithHandsontableButtonConfigurer from './markdown-it/table-with-handsontable-button';
// import TaskListsConfigurer from './markdown-it/task-lists';
// import TocAndAnchorConfigurer from './markdown-it/toc-and-anchor';


const logger = loggerFactory('growi:util:GrowiRenderer');

// declare const hljs;

// type MarkdownSettings = {
//   breaks?: boolean,
// };

// export default class GrowiRenderer {

//   RendererConfig: RendererConfig;

//   constructor(RendererConfig: RendererConfig, pagePath?: Nullable<string>) {
//     this.RendererConfig = RendererConfig;
//     this.pagePath = pagePath;

//     if (isClient() && (window as CustomWindow).growiRenderer != null) {
//       this.preProcessors = (window as CustomWindow).growiRenderer.preProcessors;
//       this.postProcessors = (window as CustomWindow).growiRenderer.postProcessors;
//     }
//     else {
//       this.preProcessors = [
//         new EasyGrid(),
//         new Linker(),
//         new CsvToTable(),
//         new XssFilter({
//           isEnabledXssPrevention: this.RendererConfig.isEnabledXssPrevention,
//           tagWhiteList: this.RendererConfig.tagWhiteList,
//           attrWhiteList: this.RendererConfig.attrWhiteList,
//         }),
//       ];
//       this.postProcessors = [
//       ];
//     }

//     this.init = this.init.bind(this);
//     this.addConfigurers = this.addConfigurers.bind(this);
//     this.setMarkdownSettings = this.setMarkdownSettings.bind(this);
//     this.configure = this.configure.bind(this);
//     this.process = this.process.bind(this);
//     this.codeRenderer = this.codeRenderer.bind(this);
//   }

//   init() {
//     let parser: Processor = unified().use(parse);
//     this.remarkPlugins.forEach((item) => {
//       parser = applyPlugin(parser, item);
//     });

//     let rehype: Processor = parser.use(remark2rehype);
//     this.rehypePlugins.forEach((item) => {
//       rehype = applyPlugin(rehype, item);
//     });

//     this.processor = rehype.use(rehype2react, {
//       createElement: React.createElement,
//       components: {
//         // a: NextLink,
//       },
//     });
//   }

//   init() {
//     // init markdown-it
//     this.md = new MarkdownIt({
//       html: true,
//       linkify: true,
//       highlight: this.codeRenderer,
//     });

//     this.isMarkdownItConfigured = false;

//     this.markdownItConfigurers = [
//       new TaskListsConfigurer(),
//       new HeaderConfigurer(),
//       new EmojiConfigurer(),
//       new MathJaxConfigurer(),
//       new DrawioViewerConfigurer(),
//       new PlantUMLConfigurer(this.RendererConfig),
//       new BlockdiagConfigurer(this.RendererConfig),
//     ];

//     if (this.pagePath != null) {
//       this.markdownItConfigurers.push(
//         new LinkerByRelativePathConfigurer(this.pagePath),
//       );
//     }
//   }

//   addConfigurers(configurers: any[]): void {
//     this.markdownItConfigurers.push(...configurers);
//   }

//   setMarkdownSettings(settings: MarkdownSettings): void {
//     this.md.set(settings);
//   }

//   configure(): void {
//     if (!this.isMarkdownItConfigured) {
//       this.markdownItConfigurers.forEach((configurer) => {
//         configurer.configure(this.md);
//       });
//     }
//   }

//   preProcess(markdown, context) {
//     let processed = markdown;
//     for (let i = 0; i < this.preProcessors.length; i++) {
//       if (!this.preProcessors[i].process) {
//         continue;
//       }
//       processed = this.preProcessors[i].process(processed, context);
//     }

//     return processed;
//   }

//   process(markdown, context) {
//     return this.md.render(markdown, context);
//   }

//   postProcess(html, context) {
//     let processed = html;
//     for (let i = 0; i < this.postProcessors.length; i++) {
//       if (!this.postProcessors[i].process) {
//         continue;
//       }
//       processed = this.postProcessors[i].process(processed, context);
//     }

//     return processed;
//   }

//   codeRenderer(code, langExt) {
//     const noborder = (!this.RendererConfig.highlightJsStyleBorder) ? 'hljs-no-border' : '';

//     let citeTag = '';
//     let hljsLang = 'plaintext';
//     let showLinenumbers = false;

//     if (langExt) {
//       // https://regex101.com/r/qGs7eZ/3
//       const match = langExt.match(/^([^:=\n]+)?(=([^:=\n]*))?(:([^:=\n]*))?(=([^:=\n]*))?$/);

//       const lang = match[1];
//       const fileName = match[5] || null;
//       showLinenumbers = (match[2] != null) || (match[6] != null);

//       if (fileName != null) {
//         citeTag = `<cite>${fileName}</cite>`;
//       }
//       if (hljs.getLanguage(lang)) {
//         hljsLang = lang;
//       }
//     }

//     let highlightCode = code;
//     try {
//       highlightCode = hljs.highlight(hljsLang, code, true).value;

//       // add line numbers
//       if (showLinenumbers) {
//         highlightCode = hljs.lineNumbersValue((highlightCode));
//       }
//     }
//     catch (err) {
//       logger.error(err);
//     }

//     return `<pre class="hljs ${noborder}">${citeTag}<code>${highlightCode}</code></pre>`;
//   }

// }

type SanitizePlugin = PluginTuple<[SanitizeOption]>;
export type RendererOptions = Omit<ReactMarkdownOptions, 'remarkPlugins' | 'rehypePlugins' | 'components' | 'children'> & {
  remarkPlugins: PluggableList,
  rehypePlugins: PluggableList,
  components?:
    | Partial<
        Omit<NormalComponents, keyof SpecialComponents>
        & SpecialComponents
        & {
          [elem: string]: ComponentType<any>,
        }
      >
    | undefined
};

const commonSanitizeOption: SanitizeOption = deepmerge(
  sanitizeDefaultSchema,
  {
    clobberPrefix: 'mdcont-',
    attributes: {
      '*': ['class', 'className', 'style'],
    },
  },
);

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

const verifySanitizePlugin = (options: RendererOptions, shouldBeTheLastItem = true): void => {
  if (hasSanitizePlugin(options, shouldBeTheLastItem)) {
    return;
  }

  throw new Error('The specified options does not have sanitize plugin in \'rehypePlugins\'');
};

const generateCommonOptions = (pagePath: string|undefined, config: RendererConfig): RendererOptions => {
  return {
    remarkPlugins: [
      gfm,
      emoji,
      pukiwikiLikeLinker,
      growiPlugin,
    ],
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

export const generateViewOptions = (
    pagePath: string,
    config: RendererConfig,
    storeTocNode: (toc: HtmlElementNode) => void,
): RendererOptions => {

  const options = generateCommonOptions(pagePath, config);

  const { remarkPlugins, rehypePlugins, components } = options;

  // add remark plugins
  remarkPlugins.push(
    math,
    [plantuml.remarkPlugin, { baseUrl: config.plantumlUri }],
    xsvToTable.remarkPlugin,
    lsxGrowiPlugin.remarkPlugin,
  );
  if (config.isEnabledLinebreaks) {
    remarkPlugins.push(breaks);
  }

  // add rehype plugins
  rehypePlugins.push(
    slug,
    [lsxGrowiPlugin.rehypePlugin, { pagePath }],
    [sanitize, deepmerge(
      commonSanitizeOption,
      lsxGrowiPlugin.sanitizeOption,
    )],
    katex,
    [toc.rehypePluginStore, { storeTocNode }],
    // [autoLinkHeadings, {
    //   behavior: 'append',
    // }]
  );

  // add components
  if (components != null) {
    components.h1 = Header;
    components.h2 = Header;
    components.h3 = Header;
    components.lsx = props => <Lsx {...props} forceToFetchData />;
  }

  // // Add configurers for viewer
  // renderer.addConfigurers([
  //   new FooternoteConfigurer(),
  //   new TocAndAnchorConfigurer(),
  //   new HeaderLineNumberConfigurer(),
  //   new HeaderWithEditLinkConfigurer(),
  //   new TableWithHandsontableButtonConfigurer(),
  // ]);

  // renderer.setMarkdownSettings({ breaks: rendererSettings.isEnabledLinebreaks });
  // renderer.configure();

  verifySanitizePlugin(options, false);
  return options;
};

export const generateTocOptions = (config: RendererConfig, tocNode: HtmlElementNode | undefined): RendererOptions => {

  const options = generateCommonOptions(undefined, config);

  const { rehypePlugins } = options;

  // add remark plugins
  // remarkPlugins.push();

  // add rehype plugins
  rehypePlugins.push(
    [toc.rehypePluginRestore, { tocNode }],
    [sanitize, commonSanitizeOption],
  );
  // renderer.rehypePlugins.push([autoLinkHeadings, {
  //   behavior: 'append',
  // }]);

  verifySanitizePlugin(options);
  return options;
};

export const generateSimpleViewOptions = (config: RendererConfig, pagePath: string, highlightKeywords?: string | string[]): RendererOptions => {
  const options = generateCommonOptions(pagePath, config);

  const { remarkPlugins, rehypePlugins, components } = options;

  // add remark plugins
  remarkPlugins.push(
    math,
    [plantuml.remarkPlugin, { baseUrl: config.plantumlUri }],
    xsvToTable.remarkPlugin,
    lsxGrowiPlugin.remarkPlugin,
  );
  if (config.isEnabledLinebreaks) {
    remarkPlugins.push(breaks);
  }

  // add rehype plugins
  rehypePlugins.push(
    [lsxGrowiPlugin.rehypePlugin, { pagePath }],
    [keywordHighlighter.rehypePlugin, { keywords: highlightKeywords }],
    [sanitize, deepmerge(
      commonSanitizeOption,
      lsxGrowiPlugin.sanitizeOption,
    )],
    katex,
  );

  // add components
  if (components != null) {
    components.lsx = props => <Lsx {...props} />;
  }

  verifySanitizePlugin(options, false);
  return options;
};

export const generatePreviewOptions = (config: RendererConfig, pagePath: string): RendererOptions => {
  const options = generateCommonOptions(pagePath, config);

  const { remarkPlugins, rehypePlugins, components } = options;

  // add remark plugins
  remarkPlugins.push(
    math,
    [plantuml.remarkPlugin, { baseUrl: config.plantumlUri }],
    xsvToTable.remarkPlugin,
    lsxGrowiPlugin.remarkPlugin,
  );
  if (config.isEnabledLinebreaks) {
    remarkPlugins.push(breaks);
  }

  // add rehype plugins
  rehypePlugins.push(
    [lsxGrowiPlugin.rehypePlugin, { pagePath }],
    addLineNumberAttribute.rehypePlugin,
    [sanitize, deepmerge(
      commonSanitizeOption,
      lsxGrowiPlugin.sanitizeOption,
      addLineNumberAttribute.sanitizeOption,
    )],
    katex,
  );

  // add components
  if (components != null) {
    components.lsx = props => <Lsx {...props} />;
  }

  verifySanitizePlugin(options, false);
  return options;
};

export const generateOthersOptions = (config: RendererConfig): RendererOptions => {
  const options = generateCommonOptions(undefined, config);
  const { rehypePlugins } = options;

  // renderer.addConfigurers([
  //   new TableConfigurer(),
  // ]);

  // renderer.setMarkdownSettings({ breaks: rendererSettings.isEnabledLinebreaks });
  // renderer.configure();

  // add rehype plugins
  rehypePlugins.push(
    [sanitize, commonSanitizeOption],
  );

  verifySanitizePlugin(options);
  return options;
};
