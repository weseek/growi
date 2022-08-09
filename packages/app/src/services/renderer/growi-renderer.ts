import MarkdownIt from 'markdown-it';

import { Nullable } from '~/interfaces/common'; // TODO: Remove this asap when the ContextExtractor is removed
import { CustomWindow } from '~/interfaces/global';
import { GrowiRendererConfig, RendererSettings } from '~/interfaces/services/renderer';
import loggerFactory from '~/utils/logger';

import CsvToTable from './PreProcessor/CsvToTable';
import EasyGrid from './PreProcessor/EasyGrid';
import Linker from './PreProcessor/Linker';
import XssFilter from './PreProcessor/XssFilter';
import BlockdiagConfigurer from './markdown-it/blockdiag';
import DrawioViewerConfigurer from './markdown-it/drawio-viewer';
import EmojiConfigurer from './markdown-it/emoji';
import FooternoteConfigurer from './markdown-it/footernote';
import HeaderConfigurer from './markdown-it/header';
import HeaderLineNumberConfigurer from './markdown-it/header-line-number';
import HeaderWithEditLinkConfigurer from './markdown-it/header-with-edit-link';
import LinkerByRelativePathConfigurer from './markdown-it/link-by-relative-path';
import OrderedListConfigurer from './markdown-it/list';
import MathJaxConfigurer from './markdown-it/mathjax';
import PlantUMLConfigurer from './markdown-it/plantuml';
import TableConfigurer from './markdown-it/table';
import TableWithHandsontableButtonConfigurer from './markdown-it/table-with-handsontable-button';
import TaskListsConfigurer from './markdown-it/task-lists';
import TocAndAnchorConfigurer from './markdown-it/toc-and-anchor';


const logger = loggerFactory('growi:util:GrowiRenderer');

declare const hljs;

type MarkdownSettings = {
  breaks?: boolean,
};

export default class GrowiRenderer {

  preProcessors: any[];

  postProcessors: any[];

  md: any;

  isMarkdownItConfigured: boolean;

  markdownItConfigurers: any[];

  growiRendererConfig: GrowiRendererConfig;

  pagePath?: Nullable<string>;

  /**
   *
   * @param {string} mode
   */
  constructor(growiRendererConfig: GrowiRendererConfig, pagePath?: Nullable<string>) {
    this.growiRendererConfig = growiRendererConfig;
    this.pagePath = pagePath;

    if ((window as CustomWindow).growiRenderer != null) {
      this.preProcessors = (window as CustomWindow).growiRenderer.preProcessors;
      this.postProcessors = (window as CustomWindow).growiRenderer.postProcessors;
    }
    else {
      this.preProcessors = [
        new EasyGrid(),
        new Linker(),
        new CsvToTable(),
        new XssFilter({
          isEnabledXssPrevention: this.growiRendererConfig.isEnabledXssPrevention,
          tagWhiteList: this.growiRendererConfig.tagWhiteList,
          attrWhiteList: this.growiRendererConfig.attrWhiteList,
        }),
      ];
      this.postProcessors = [
      ];
    }

    this.init = this.init.bind(this);
    this.addConfigurers = this.addConfigurers.bind(this);
    this.setMarkdownSettings = this.setMarkdownSettings.bind(this);
    this.configure = this.configure.bind(this);
    this.process = this.process.bind(this);
    this.codeRenderer = this.codeRenderer.bind(this);
  }

  init() {
    // init markdown-it
    this.md = new MarkdownIt({
      html: true,
      linkify: true,
      highlight: this.codeRenderer,
    });

    this.isMarkdownItConfigured = false;

    this.markdownItConfigurers = [
      new TaskListsConfigurer(),
      new HeaderConfigurer(),
      new EmojiConfigurer(),
      new MathJaxConfigurer(this.growiRendererConfig),
      new DrawioViewerConfigurer(),
      new PlantUMLConfigurer(this.growiRendererConfig),
      new BlockdiagConfigurer(this.growiRendererConfig),
      new OrderedListConfigurer(),
    ];

    if (this.pagePath != null) {
      this.markdownItConfigurers.push(
        new LinkerByRelativePathConfigurer(this.pagePath),
      );
    }
  }

  addConfigurers(configurers: any[]): void {
    this.markdownItConfigurers.push(...configurers);
  }

  setMarkdownSettings(settings: MarkdownSettings): void {
    this.md.set(settings);
  }

  configure(): void {
    if (!this.isMarkdownItConfigured) {
      this.markdownItConfigurers.forEach((configurer) => {
        configurer.configure(this.md);
      });
    }
  }

  preProcess(markdown, context) {
    let processed = markdown;
    for (let i = 0; i < this.preProcessors.length; i++) {
      if (!this.preProcessors[i].process) {
        continue;
      }
      processed = this.preProcessors[i].process(processed, context);
    }

    return processed;
  }

  process(markdown, context) {
    return this.md.render(markdown, context);
  }

  postProcess(html, context) {
    let processed = html;
    for (let i = 0; i < this.postProcessors.length; i++) {
      if (!this.postProcessors[i].process) {
        continue;
      }
      processed = this.postProcessors[i].process(processed, context);
    }

    return processed;
  }

  codeRenderer(code, langExt) {
    const noborder = (!this.growiRendererConfig.highlightJsStyleBorder) ? 'hljs-no-border' : '';

    let citeTag = '';
    let hljsLang = 'plaintext';
    let showLinenumbers = false;

    if (langExt) {
      // https://regex101.com/r/qGs7eZ/3
      const match = langExt.match(/^([^:=\n]+)?(=([^:=\n]*))?(:([^:=\n]*))?(=([^:=\n]*))?$/);

      const lang = match[1];
      const fileName = match[5] || null;
      showLinenumbers = (match[2] != null) || (match[6] != null);

      if (fileName != null) {
        citeTag = `<cite>${fileName}</cite>`;
      }
      if (hljs.getLanguage(lang)) {
        hljsLang = lang;
      }
    }

    let highlightCode = code;
    try {
      highlightCode = hljs.highlight(hljsLang, code, true).value;

      // add line numbers
      if (showLinenumbers) {
        highlightCode = hljs.lineNumbersValue((highlightCode));
      }
    }
    catch (err) {
      logger.error(err);
    }

    return `<pre class="hljs ${noborder}">${citeTag}<code>${highlightCode}</code></pre>`;
  }

}

export interface RendererGenerator {
  (growiRendererConfig: GrowiRendererConfig, rendererSettings: RendererSettings | null, pagePath?: Nullable<string>): GrowiRenderer
}

export const generateViewRenderer: RendererGenerator = (
    growiRendererConfig: GrowiRendererConfig, rendererSettings: RendererSettings, pagePath?: Nullable<string>,
): GrowiRenderer => {
  const renderer = new GrowiRenderer(growiRendererConfig, pagePath);
  renderer.init();

  // Add configurers for viewer
  renderer.addConfigurers([
    new FooternoteConfigurer(),
    new TocAndAnchorConfigurer(),
    new HeaderLineNumberConfigurer(),
    new HeaderWithEditLinkConfigurer(),
    new TableWithHandsontableButtonConfigurer(),
  ]);

  renderer.setMarkdownSettings({ breaks: rendererSettings.isEnabledLinebreaks });
  renderer.configure();

  return renderer;
};

export const generatePreviewRenderer: RendererGenerator = (
    growiRendererConfig: GrowiRendererConfig, rendererSettings: RendererSettings | null, pagePath?: Nullable<string>,
): GrowiRenderer => {
  const renderer = new GrowiRenderer(growiRendererConfig, pagePath);
  renderer.init();

  // Add configurers for preview
  renderer.addConfigurers([
    new FooternoteConfigurer(),
    new HeaderLineNumberConfigurer(),
    new TableConfigurer(),
  ]);

  renderer.setMarkdownSettings({ breaks: rendererSettings?.isEnabledLinebreaks });
  renderer.configure();

  return renderer;
};

export const generateCommentPreviewRenderer: RendererGenerator = (
    growiRendererConfig: GrowiRendererConfig, rendererSettings: RendererSettings, pagePath?: Nullable<string>,
): GrowiRenderer => {
  const renderer = new GrowiRenderer(growiRendererConfig, pagePath);
  renderer.init();

  renderer.addConfigurers([
    new TableConfigurer(),
  ]);

  renderer.setMarkdownSettings({ breaks: rendererSettings.isEnabledLinebreaksInComments });
  renderer.configure();

  return renderer;
};

export const generateOthersRenderer: RendererGenerator = (
    growiRendererConfig: GrowiRendererConfig, rendererSettings: RendererSettings, pagePath?: Nullable<string>,
): GrowiRenderer => {
  const renderer = new GrowiRenderer(growiRendererConfig, pagePath);
  renderer.init();

  renderer.addConfigurers([
    new TableConfigurer(),
  ]);

  renderer.setMarkdownSettings({ breaks: rendererSettings.isEnabledLinebreaks });
  renderer.configure();

  return renderer;
};
