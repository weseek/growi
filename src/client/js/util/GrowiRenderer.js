import MarkdownIt from 'markdown-it';

import Linker from './PreProcessor/Linker';
import CsvToTable from './PreProcessor/CsvToTable';
import XssFilter from './PreProcessor/XssFilter';

import EmojiConfigurer from './markdown-it/emoji';
import FooternoteConfigurer from './markdown-it/footernote';
import HeaderLineNumberConfigurer from './markdown-it/header-line-number';
import HeaderConfigurer from './markdown-it/header';
import MathJaxConfigurer from './markdown-it/mathjax';
import PlantUMLConfigurer from './markdown-it/plantuml';
import TableConfigurer from './markdown-it/table';
import TaskListsConfigurer from './markdown-it/task-lists';
import TocAndAnchorConfigurer from './markdown-it/toc-and-anchor';
import BlockdiagConfigurer from './markdown-it/blockdiag';
import TableWithHandsontableButtonConfigurer from './markdown-it/table-with-handsontable-button';
import HeaderWithEditLinkConfigurer from './markdown-it/header-with-edit-link';

const logger = require('@alias/logger')('growi:util:GrowiRenderer');

export default class GrowiRenderer {

  /**
   *
   * @param {AppContainer} appContainer
   * @param {GrowiRenderer} originRenderer
   * @param {string} mode
   */
  constructor(appContainer, originRenderer) {
    this.appContainer = appContainer;

    if (originRenderer != null) {
      this.preProcessors = originRenderer.preProcessors;
      this.postProcessors = originRenderer.postProcessors;
    }
    else {
      this.preProcessors = [
        new Linker(appContainer),
        new CsvToTable(appContainer),
        new XssFilter(appContainer),
      ];
      this.postProcessors = [
      ];
    }

    this.initMarkdownItConfigurers = this.initMarkdownItConfigurers.bind(this);
    this.setup = this.setup.bind(this);
    this.process = this.process.bind(this);
    this.codeRenderer = this.codeRenderer.bind(this);
  }

  initMarkdownItConfigurers(mode) {
    const appContainer = this.appContainer;

    // init markdown-it
    this.md = new MarkdownIt({
      html: true,
      linkify: true,
      highlight: this.codeRenderer,
    });

    this.isMarkdownItConfigured = false;

    this.markdownItConfigurers = [
      new TaskListsConfigurer(appContainer),
      new HeaderConfigurer(appContainer),
      new EmojiConfigurer(appContainer),
      new MathJaxConfigurer(appContainer),
      new PlantUMLConfigurer(appContainer),
      new BlockdiagConfigurer(appContainer),
    ];

    // add configurers according to mode
    switch (mode) {
      case 'page': {
        const pageContainer = appContainer.getContainer('PageContainer');

        this.markdownItConfigurers = this.markdownItConfigurers.concat([
          new FooternoteConfigurer(appContainer),
          new TocAndAnchorConfigurer(appContainer, pageContainer.setTocHtml),
          new HeaderLineNumberConfigurer(appContainer),
          new HeaderWithEditLinkConfigurer(appContainer),
          new TableWithHandsontableButtonConfigurer(appContainer),
        ]);
        break;
      }
      case 'editor':
        this.markdownItConfigurers = this.markdownItConfigurers.concat([
          new FooternoteConfigurer(appContainer),
          new HeaderLineNumberConfigurer(appContainer),
          new TableConfigurer(appContainer),
        ]);
        break;
      // case 'comment':
      //   break;
      default:
        this.markdownItConfigurers = this.markdownItConfigurers.concat([
          new TableConfigurer(appContainer),
        ]);
        break;
    }
  }

  /**
   * setup with crowi config
   */
  setup(mode) {
    const crowiConfig = this.appContainer.config;

    let isEnabledLinebreaks;
    switch (mode) {
      case 'comment':
        isEnabledLinebreaks = crowiConfig.isEnabledLinebreaksInComments;
        break;
      default:
        isEnabledLinebreaks = crowiConfig.isEnabledLinebreaks;
        break;
    }

    this.md.set({
      breaks: isEnabledLinebreaks,
    });

    if (!this.isMarkdownItConfigured) {
      this.markdownItConfigurers.forEach((configurer) => {
        configurer.configure(this.md);
      });
    }
  }

  preProcess(markdown) {
    let processed = markdown;
    for (let i = 0; i < this.preProcessors.length; i++) {
      if (!this.preProcessors[i].process) {
        continue;
      }
      processed = this.preProcessors[i].process(processed);
    }

    return processed;
  }

  process(markdown) {
    return this.md.render(markdown);
  }

  postProcess(html) {
    let processed = html;
    for (let i = 0; i < this.postProcessors.length; i++) {
      if (!this.postProcessors[i].process) {
        continue;
      }
      processed = this.postProcessors[i].process(processed);
    }

    return processed;
  }

  codeRenderer(code, langExt) {
    const config = this.appContainer.getConfig();
    const noborder = (!config.highlightJsStyleBorder) ? 'hljs-no-border' : '';

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

  highlightCode(code, lang) {
  }

}
