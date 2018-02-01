import MarkdownIt from 'markdown-it';
import * as entities from 'entities';

import Linker        from './PreProcessor/Linker';
import CsvToTable    from './PreProcessor/CsvToTable';
import XssFilter     from './PreProcessor/XssFilter';

import Template from './LangProcessor/Template';

import CommonPluginsConfigurer from './markdown-it/common-plugins';
import EmojiConfigurer from './markdown-it/emoji';
import MathJaxConfigurer from './markdown-it/mathjax';
import PlantUMLConfigurer from './markdown-it/plantuml';
import TableConfigurer from './markdown-it/table';

export default class GrowiRenderer {


  constructor(crowi) {
    this.crowi = crowi;

    this.preProcessors = [
      new Linker(crowi),
      new CsvToTable(crowi),
      new XssFilter(crowi),
    ];
    this.postProcessors = [
    ];
    this.markdownItConfigurers = [
      new CommonPluginsConfigurer(crowi),
      new EmojiConfigurer(crowi),
      new MathJaxConfigurer(crowi),
      new PlantUMLConfigurer(crowi),
      new TableConfigurer(crowi),
    ];
    this.langProcessors = {
      'template': new Template(crowi),
    };

    this.configure = this.configure.bind(this);
    this.configurePlugins = this.configurePlugins.bind(this);
    this.parseMarkdown = this.parseMarkdown.bind(this);
    this.codeRenderer = this.codeRenderer.bind(this);

    this.md = new MarkdownIt();
    this.configure(this.crowi.getConfig());
    this.configurePlugins(this.crowi.getConfig());
  }

  /**
   * configure markdown-it
   * @param {any} config
   */
  configure(config) {
    this.md.set({
      html: true,
      linkify: true,
      breaks: config.isEnabledLineBreaks,
      highlight: this.codeRenderer,
    });
  }

  /**
   * configure markdown-it plugins
   * @param {any} config
   */
  configurePlugins(config) {
    this.markdownItConfigurers.forEach((configurer) => {
      configurer.configure(this.md);
    });
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

      if (hljs.getLanguage(lang)) {
        let citeTag = (langFn) ? `<cite>${langFn}</cite>` : '';
        try {
          return `<pre class="hljs">${citeTag}<code class="language-${lang}">${hljs.highlight(lang, code, true).value}</code></pre>`;
        } catch (__) {}
      }
    }

    return '';
  }

  parseMarkdown(markdown, dom, markedOpts) {
    let parsed = '';
    parsed = this.md.render(markdown);
    return parsed;
  }

  /**
   * render
   *
   * @param {string} markdown
   * @param {Element} dom
   * @returns
   *
   * @memberOf CrowiRenderer
   */
  render(markdown, dom) {
    let html = '';

    html = this.parseMarkdown(markdown, dom);
    html = this.postProcess(html, dom);

    return html;
  }
}
