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


  constructor(crowi, option) {
    this.crowi = crowi;

    this.preProcessors = [
      new Linker(crowi),
      new CsvToTable(crowi),
      new XssFilter(crowi),
    ];
    this.postProcessors = [
    ];

    this.langProcessors = {
      'template': new Template(crowi),
    };

    this.configure = this.configure.bind(this);
    this.configureMarkdownIt = this.configureMarkdownIt.bind(this);
    this.process = this.process.bind(this);
    this.codeRenderer = this.codeRenderer.bind(this);

    this.md = new MarkdownIt();
    this.configure(this.crowi.getConfig());
    this.configureMarkdownIt(option);

  }

  configureMarkdownIt(option) {
    const crowi = this.crowi;

    let configurers = [
      new CommonPluginsConfigurer(crowi),
      new HeaderConfigurer(crowi),
      new TableConfigurer(crowi),
      new EmojiConfigurer(crowi),
      new MathJaxConfigurer(crowi),
      new PlantUMLConfigurer(crowi),
    ];

    if (option != null) {
      const mode = option.mode;
      switch (mode) {
        case 'page':
          configurers = configurers.concat([
            new TocAndAnchorConfigurer(crowi, option.renderToc),
            new HeaderLineNumberConfigurer(crowi),
          ]);
          break;
        case 'editor':
          configurers = configurers.concat([
            new HeaderLineNumberConfigurer(crowi)
          ]);
          break;
        case 'timeline':
          break;
        case 'searchresult':
          break;
      }
    }

    configurers.forEach((configurer) => {
      configurer.configure(this.md);
    });
  }

  /**
   * configure with crowi config
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

      if (hljs.getLanguage(lang)) {
        let citeTag = (langFn) ? `<cite>${langFn}</cite>` : '';
        try {
          return `<pre class="hljs">${citeTag}<code class="language-${lang}">${hljs.highlight(lang, code, true).value}</code></pre>`;
        } catch (__) {}
      }
    }

    return '';
  }

}
