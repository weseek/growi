import { ReactMarkdownOptions } from 'react-markdown/lib/react-markdown';
import slug from 'rehype-slug';
import breaks from 'remark-breaks';
import emoji from 'remark-emoji';
import footnotes from 'remark-footnotes';
import gfm from 'remark-gfm';

import { Header } from '~/components/ReactMarkdownComponents/Header';
import { NextLink } from '~/components/ReactMarkdownComponents/NextLink';
import { RendererConfig } from '~/interfaces/services/renderer';
import loggerFactory from '~/utils/logger';

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

export type RendererOptions = Partial<ReactMarkdownOptions>;

export interface RendererOptionsCustomizer {
  (options: RendererOptions): void
}

export interface ReactMarkdownOptionsGenerator {
  (config: RendererConfig, customizer?: RendererOptionsCustomizer): RendererOptions
}

const generateCommonOptions: ReactMarkdownOptionsGenerator = (config: RendererConfig): RendererOptions => {
  return {
    remarkPlugins: [gfm],
    rehypePlugins: [slug],
    components: {
      a: NextLink,
    },
  };
};

export const generateViewOptions: ReactMarkdownOptionsGenerator = (config: RendererConfig, customizer?: RendererOptionsCustomizer): RendererOptions => {

  const options = generateCommonOptions(config);

  const { remarkPlugins, components } = options;

  // add remark plugins
  if (remarkPlugins != null) {
    remarkPlugins.push(footnotes);
    remarkPlugins.push(emoji);
    if (config.isEnabledLinebreaks) {
      remarkPlugins.push(breaks);
    }
  }

  if (customizer != null) {
    // use rehype-toc and get toc node
    customizer(options);
  }
  // rehypePlugins.push([toc, {
  //   headings: ['h1', 'h2', 'h3'],
  //   customizeTOC: storeTocNode,
  // }]);
  // renderer.rehypePlugins.push([autoLinkHeadings, {
  //   behavior: 'append',
  // }]);

  // add components
  if (components != null) {
    components.h1 = Header;
    components.h2 = Header;
    components.h3 = Header;
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

  return options;
};

export const generateTocOptions: ReactMarkdownOptionsGenerator = (config: RendererConfig, customizer?: RendererOptionsCustomizer): RendererOptions => {

  const options = generateCommonOptions(config);

  const { remarkPlugins } = options;

  // add remark plugins
  if (remarkPlugins != null) {
    remarkPlugins.push(emoji);
  }

  if (customizer != null) {
    // use rehype-toc and set toc node
    customizer(options);
  }
  // renderer.rehypePlugins.push([autoLinkHeadings, {
  //   behavior: 'append',
  // }]);

  return options;
};

export const generatePreviewOptions: ReactMarkdownOptionsGenerator = (config: RendererConfig): RendererOptions => {
  const options = generateCommonOptions(config);

  // // Add configurers for preview
  // renderer.addConfigurers([
  //   new FooternoteConfigurer(),
  //   new HeaderLineNumberConfigurer(),
  //   new TableConfigurer(),
  // ]);

  // renderer.setMarkdownSettings({ breaks: rendererSettings?.isEnabledLinebreaks });
  // renderer.configure();

  return options;
};

export const generateCommentPreviewOptions: ReactMarkdownOptionsGenerator = (config: RendererConfig): RendererOptions => {
  const options = generateCommonOptions(config);

  // renderer.addConfigurers([
  //   new TableConfigurer(),
  // ]);

  // renderer.setMarkdownSettings({ breaks: rendererSettings.isEnabledLinebreaksInComments });
  // renderer.configure();

  return options;
};

export const generateOthersOptions: ReactMarkdownOptionsGenerator = (config: RendererConfig): RendererOptions => {
  const options = generateCommonOptions(config);

  // renderer.addConfigurers([
  //   new TableConfigurer(),
  // ]);

  // renderer.setMarkdownSettings({ breaks: rendererSettings.isEnabledLinebreaks });
  // renderer.configure();

  return options;
};
