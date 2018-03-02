import MarkdownIt from 'markdown-it';
import * as entities from 'entities';

import Linker        from './PreProcessor/Linker';
import CsvToTable    from './PreProcessor/CsvToTable';
import XssFilter     from './PreProcessor/XssFilter';

import Template from './LangProcessor/Template';

import CommonPluginsConfigurer from './markdown-it/common-plugins';
import EmojiConfigurer from './markdown-it/emoji';
import HeaderLineNumberConfigurer from './markdown-it/header-line-number';
import HeaderConfigurer from './markdown-it/header';
import MathJaxConfigurer from './markdown-it/mathjax';
import PlantUMLConfigurer from './markdown-it/plantuml';
import TableConfigurer from './markdown-it/table';
import TocAndAnchorConfigurer from './markdown-it/toc-and-anchor';

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

    // initialize processors
    //  that will be retrieved if originRenderer exists
    this.preProcessors = this.originRenderer.preProcessors || [
      new Linker(crowi),
      new CsvToTable(crowi),
      new XssFilter(crowi),
    ];
    this.postProcessors = this.originRenderer.postProcessors || [
    ];

    this.langProcessors = this.originRenderer.langProcessors || {
      'template': new Template(crowi),
    };

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
      new CommonPluginsConfigurer(crowi),
      new HeaderConfigurer(crowi),
      new TableConfigurer(crowi),
      new EmojiConfigurer(crowi),
      new MathJaxConfigurer(crowi),
      new PlantUMLConfigurer(crowi),
    ];

    // add configurers according to mode
    const mode = options.mode;
    switch (mode) {
      case 'page':
        this.markdownItConfigurers = this.markdownItConfigurers.concat([
          new TocAndAnchorConfigurer(crowi, options.renderToc),
          new HeaderLineNumberConfigurer(crowi),
        ]);
        break;
      case 'editor':
        this.markdownItConfigurers = this.markdownItConfigurers.concat([
          new HeaderLineNumberConfigurer(crowi)
        ]);
        break;
      case 'timeline':
        break;
      case 'searchresult':
        break;
    }
  }

  /**
   * setup with crowi config
   * @param {any} config crowi config
   */
  setup(config) {
    this.md.set({
      breaks: config.isEnabledLineBreaks,
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

  postProcess(html, dom) {
    for (let i = 0; i < this.postProcessors.length; i++) {
      if (!this.postProcessors[i].process) {
        continue;
      }
      html = this.postProcessors[i].process(html, dom);
    }

    return html;
  }

  codeRenderer(code, langExt) {
    if (langExt) {
      const langAndFn = langExt.split(':');
      const lang = langAndFn[0];
      const langFn = langAndFn[1] || null;

      // process langProcessors
      if (this.langProcessors[lang] != null) {
        return this.langProcessors[lang].process(code, langExt);
      }

      const citeTag = (langFn) ? `<cite>${langFn}</cite>` : '';
      if (hljs.getLanguage(lang)) {
        try {
          return `<pre class="hljs">${citeTag}<code class="language-${lang}">${hljs.highlight(lang, code, true).value}</code></pre>`;
        } catch (__) {}
      }
      else {
        return `<pre class="hljs">${citeTag}<code>${code}</code></pre>`;
      }
    }

    return '';
  }

}
