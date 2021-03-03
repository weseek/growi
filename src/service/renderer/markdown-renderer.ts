// import MarkdownIt from 'markdown-it';

// import Linker from './PreProcessor/Linker';
// import CsvToTable from './PreProcessor/CsvToTable';
// import EasyGrid from './PreProcessor/EasyGrid';
// import XssFilter from './PreProcessor/XssFilter';

// import EmojiConfigurer from './markdown-it/emoji';
// import FooternoteConfigurer from './markdown-it/footernote';
// import HeaderLineNumberConfigurer from './markdown-it/header-line-number';
// import HeaderConfigurer from './markdown-it/header';
// import MathJaxConfigurer from './markdown-it/mathjax';
// import PlantUMLConfigurer from './markdown-it/plantuml';
// import TableConfigurer from './markdown-it/table';
// import TaskListsConfigurer from './markdown-it/task-lists';
// import TocAndAnchorConfigurer from './markdown-it/toc-and-anchor';
// import BlockdiagConfigurer from './markdown-it/blockdiag';
// import DrawioViewerConfigurer from './markdown-it/drawio-viewer';
// import TableWithHandsontableButtonConfigurer from './markdown-it/table-with-handsontable-button';
// import HeaderWithEditLinkConfigurer from './markdown-it/header-with-edit-link';

import React from 'react';
import unified, { Plugin, PluginTuple, Processor } from 'unified';
import parse from 'remark-parse';
import gfm from 'remark-gfm';
import footnotes from 'remark-footnotes';
import emoji from 'remark-emoji';
import breaks from 'remark-breaks';
import remark2rehype from 'remark-rehype';
import slug from 'rehype-slug';
import toc, { HtmlElementNode } from 'rehype-toc';
import autoLinkHeadings from 'rehype-autolink-headings';
import rehype2react from 'rehype-react';

import NextLink from '~/components/rehype2react/NextLink';
import { RendererSettings } from '~/interfaces/renderer';
import loggerFactory from '~/utils/logger';

const logger = loggerFactory('growi:service:MarkdownRenderer');


function applyPlugin(processor: Processor, plugin: Plugin | PluginTuple): Processor {
  if (Array.isArray(plugin)) {
    return processor.use(...plugin);
  }

  return processor.use(plugin);
}

export default class MarkdownRenderer {

  remarkPlugins: (Plugin | PluginTuple)[] = [
    gfm,
  ];

  rehypePlugins: (Plugin | PluginTuple)[] = [
    slug,
  ];

  processor?: Processor;

  // constructor() {
  //   this.appContainer = appContainer;

  //   if (originRenderer != null) {
  //     this.preProcessors = originRenderer.preProcessors;
  //     this.postProcessors = originRenderer.postProcessors;
  //   }
  //   else {
  //     this.preProcessors = [
  //       new EasyGrid(appContainer),
  //       new Linker(appContainer),
  //       new CsvToTable(appContainer),
  //       new XssFilter(appContainer),
  //     ];
  //     this.postProcessors = [
  //     ];
  //   }
  // }

  init() {
    let parser = unified().use(parse);
    this.remarkPlugins.forEach((item) => {
      parser = applyPlugin(parser, item);
    });

    let rehype = parser.use(remark2rehype);
    this.rehypePlugins.forEach((item) => {
      rehype = applyPlugin(rehype, item);
    });

    this.processor = rehype.use(rehype2react, {
      createElement: React.createElement,
      components: {
        a: NextLink,
      },
    });
  }

  // initMarkdownItConfigurers(mode) {
  //   const appContainer = this.appContainer;

  //   // init markdown-it
  //   this.md = new MarkdownIt({
  //     html: true,
  //     linkify: true,
  //     highlight: this.codeRenderer,
  //   });

  //   this.isMarkdownItConfigured = false;

  //   this.markdownItConfigurers = [
  //     new TaskListsConfigurer(appContainer),
  //     new HeaderConfigurer(appContainer),
  //     new EmojiConfigurer(appContainer),
  //     new MathJaxConfigurer(appContainer),
  //     new DrawioViewerConfigurer(appContainer),
  //     new PlantUMLConfigurer(appContainer),
  //     new BlockdiagConfigurer(appContainer),
  //   ];

  //   // add configurers according to mode
  //   switch (mode) {
  //     case 'page': {
  //       const pageContainer = appContainer.getContainer('PageContainer');

  //       this.markdownItConfigurers = this.markdownItConfigurers.concat([
  //         new FooternoteConfigurer(appContainer),
  //         new TocAndAnchorConfigurer(appContainer, pageContainer.setTocHtml),
  //         new HeaderLineNumberConfigurer(appContainer),
  //         new HeaderWithEditLinkConfigurer(appContainer),
  //         new TableWithHandsontableButtonConfigurer(appContainer),
  //       ]);
  //       break;
  //     }
  //     case 'editor':
  //       this.markdownItConfigurers = this.markdownItConfigurers.concat([
  //         new FooternoteConfigurer(appContainer),
  //         new HeaderLineNumberConfigurer(appContainer),
  //         new TableConfigurer(appContainer),
  //       ]);
  //       break;
  //     // case 'comment':
  //     //   break;
  //     default:
  //       this.markdownItConfigurers = this.markdownItConfigurers.concat([
  //         new TableConfigurer(appContainer),
  //       ]);
  //       break;
  //   }
  // }

  /**
   * setup with crowi config
   */
  // setup(mode) {
  //   const crowiConfig = this.appContainer.config;

  //   let isEnabledLinebreaks;
  //   switch (mode) {
  //     case 'comment':
  //       isEnabledLinebreaks = crowiConfig.isEnabledLinebreaksInComments;
  //       break;
  //     default:
  //       isEnabledLinebreaks = crowiConfig.isEnabledLinebreaks;
  //       break;
  //   }

  //   this.md.set({
  //     breaks: isEnabledLinebreaks,
  //   });

  //   if (!this.isMarkdownItConfigured) {
  //     this.markdownItConfigurers.forEach((configurer) => {
  //       configurer.configure(this.md);
  //     });
  //   }
  // }

  // preProcess(markdown) {
  //   let processed = markdown;
  //   for (let i = 0; i < this.preProcessors.length; i++) {
  //     if (!this.preProcessors[i].process) {
  //       continue;
  //     }
  //     processed = this.preProcessors[i].process(processed);
  //   }

  //   return processed;
  // }

  // process(markdown) {
  //   return this.md.render(markdown);
  // }

  // postProcess(html) {
  //   let processed = html;
  //   for (let i = 0; i < this.postProcessors.length; i++) {
  //     if (!this.postProcessors[i].process) {
  //       continue;
  //     }
  //     processed = this.postProcessors[i].process(processed);
  //   }

  //   return processed;
  // }

  // codeRenderer(code, langExt) {
  //   const config = this.appContainer.getConfig();
  //   const noborder = (!config.highlightJsStyleBorder) ? 'hljs-no-border' : '';

  //   let citeTag = '';
  //   let hljsLang = 'plaintext';
  //   let showLinenumbers = false;

  //   if (langExt) {
  //     // https://regex101.com/r/qGs7eZ/3
  //     const match = langExt.match(/^([^:=\n]+)?(=([^:=\n]*))?(:([^:=\n]*))?(=([^:=\n]*))?$/);

  //     const lang = match[1];
  //     const fileName = match[5] || null;
  //     showLinenumbers = (match[2] != null) || (match[6] != null);

  //     if (fileName != null) {
  //       citeTag = `<cite>${fileName}</cite>`;
  //     }
  //     if (hljs.getLanguage(lang)) {
  //       hljsLang = lang;
  //     }
  //   }

  //   let highlightCode = code;
  //   try {
  //     highlightCode = hljs.highlight(hljsLang, code, true).value;

  //     // add line numbers
  //     if (showLinenumbers) {
  //       highlightCode = hljs.lineNumbersValue((highlightCode));
  //     }
  //   }
  //   catch (err) {
  //     logger.error(err);
  //   }

  //   return `<pre class="hljs ${noborder}">${citeTag}<code>${highlightCode}</code></pre>`;
  // }

}

export const generateViewRenderer = (rendererSettings: RendererSettings, storeTocNode?: (toc: HtmlElementNode) => void): MarkdownRenderer => {
  const renderer = new MarkdownRenderer();
  // add remark plugins
  renderer.remarkPlugins.push(footnotes);
  renderer.remarkPlugins.push(emoji);
  if (rendererSettings.isEnabledLinebreaks) {
    renderer.remarkPlugins.push(breaks);
  }
  // add rehypePlugins
  renderer.rehypePlugins.push([toc, {
    headings: ['h1', 'h2', 'h3'],
    customizeTOC: storeTocNode,
  }]);
  renderer.rehypePlugins.push([autoLinkHeadings, {
    behavior: 'append',
  }]);
  renderer.init();

  return renderer;
};

export const generatePreviewRenderer = (): MarkdownRenderer => {
  const renderer = new MarkdownRenderer();
  renderer.init();

  return renderer;
};

export const generateCommentPreviewRenderer = (): MarkdownRenderer => {
  const renderer = new MarkdownRenderer();
  renderer.init();

  return renderer;
};
