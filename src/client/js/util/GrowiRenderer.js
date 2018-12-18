import MarkdownIt from 'markdown-it';
import xss from 'xss';

import Linker        from './PreProcessor/Linker';
import CsvToTable    from './PreProcessor/CsvToTable';
import XssFilter     from './PreProcessor/XssFilter';
import CrowiTemplate from './PostProcessor/CrowiTemplate';

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

export default class GrowiRenderer {

  /**
   *
   * @param {Crowi} crowi
   * @param {GrowiRenderer} originRenderer may be customized by plugins
   * @param {object} options
   */
  constructor(crowi, originRenderer, options) {
    this.crowi = crowi;
    this.originRenderer = originRenderer || {};
    this.options = Object.assign( // merge options
      { isAutoSetup: true },      // default options
      options || {});             // specified options

    this.xssFilterForCode = new xss.FilterXSS();

    // initialize processors
    //  that will be retrieved if originRenderer exists
    this.preProcessors = this.originRenderer.preProcessors || [
      new Linker(crowi),
      new CsvToTable(crowi),
      new XssFilter(crowi),
    ];
    this.postProcessors = this.originRenderer.postProcessors || [
      new CrowiTemplate(crowi),
    ];

    this.initMarkdownItConfigurers = this.initMarkdownItConfigurers.bind(this);
    this.setup = this.setup.bind(this);
    this.process = this.process.bind(this);
    this.codeRenderer = this.codeRenderer.bind(this);

    // init markdown-it
    this.md = new MarkdownIt({
      html: true,
      linkify: true,
      highlight: this.codeRenderer,
    });
    this.initMarkdownItConfigurers(options);

    // auto setup
    if (this.options.isAutoSetup) {
      this.setup(crowi.getConfig());
    }
  }

  initMarkdownItConfigurers(options) {
    const crowi = this.crowi;

    this.isMarkdownItConfigured = false;

    this.markdownItConfigurers = [
      new TaskListsConfigurer(crowi),
      new HeaderConfigurer(crowi),
      new EmojiConfigurer(crowi),
      new MathJaxConfigurer(crowi),
      new PlantUMLConfigurer(crowi),
      new BlockdiagConfigurer(crowi),
    ];

    // add configurers according to mode
    const mode = options.mode;
    switch (mode) {
      case 'page':
        this.markdownItConfigurers = this.markdownItConfigurers.concat([
          new FooternoteConfigurer(crowi),
          new TocAndAnchorConfigurer(crowi, options.renderToc),
          new HeaderLineNumberConfigurer(crowi),
          new HeaderWithEditLinkConfigurer(crowi),
          new TableWithHandsontableButtonConfigurer(crowi)
        ]);
        break;
      case 'editor':
        this.markdownItConfigurers = this.markdownItConfigurers.concat([
          new FooternoteConfigurer(crowi),
          new HeaderLineNumberConfigurer(crowi),
          new TableConfigurer(crowi)
        ]);
        break;
      // case 'comment':
      //   break;
      default:
        this.markdownItConfigurers = this.markdownItConfigurers.concat([
          new TableConfigurer(crowi)
        ]);
        break;
    }
  }

  /**
   * setup with crowi config
   */
  setup() {
    const crowiConfig = this.crowi.config;

    let isEnabledLinebreaks = undefined;
    switch (this.options.mode) {
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
    for (let i = 0; i < this.preProcessors.length; i++) {
      if (!this.preProcessors[i].process) {
        continue;
      }
      markdown = this.preProcessors[i].process(markdown);
    }

    return markdown;
  }

  process(markdown) {
    return this.md.render(markdown);
  }

  postProcess(html) {
    for (let i = 0; i < this.postProcessors.length; i++) {
      if (!this.postProcessors[i].process) {
        continue;
      }
      html = this.postProcessors[i].process(html);
    }

    return html;
  }

  codeRenderer(code, langExt) {
    const config = this.crowi.getConfig();
    const noborder = (!config.highlightJsStyleBorder) ? 'hljs-no-border' : '';

    if (langExt) {
      const langAndFn = langExt.split(':');
      const lang = langAndFn[0];
      const langFn = langAndFn[1] || null;

      const citeTag = (langFn) ? `<cite>${langFn}</cite>` : '';
      if (hljs.getLanguage(lang)) {
        try {
          return `<pre class="hljs ${noborder}">${citeTag}<code class="language-${lang}">${hljs.highlight(lang, code, true).value}</code></pre>`;
        }
        catch (__) {
          return `<pre class="hljs ${noborder}">${citeTag}<code class="language-${lang}">${code}}</code></pre>`;
        }
      }
      else {
        const escapedCode = this.xssFilterForCode.process(code);
        return `<pre class="hljs ${noborder}">${citeTag}<code>${escapedCode}</code></pre>`;
      }
    }

    const escapedCode = this.xssFilterForCode.process(code);
    return `<pre class="hljs ${noborder}"><code>${escapedCode}</code></pre>`;
  }

}
