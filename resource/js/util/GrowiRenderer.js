import MarkdownIt from 'markdown-it';
import * as entities from 'entities';

import Linker        from './PreProcessor/Linker';
import XssFilter     from './PreProcessor/XssFilter';

import Tsv2Table from './LangProcessor/Tsv2Table';
import Template from './LangProcessor/Template';
import PlantUML from './LangProcessor/PlantUML';

export default class GrowiRenderer {


  constructor(crowi) {
    this.crowi = crowi;

    this.md = new MarkdownIt();
    this.configure(this.crowi.getConfig());
    this.configurePlugins(this.crowi.getConfig());

    this.preProcessors = [
      new Linker(crowi),
      new XssFilter(crowi),
    ];
    this.postProcessors = [
    ];

    this.langProcessors = {
      'tsv': new Tsv2Table(crowi),
      'tsv-h': new Tsv2Table(crowi, {header: true}),
      'template': new Template(crowi),
      'plantuml': new PlantUML(crowi),
    };

    this.configure = this.configure.bind(this);
    this.parseMarkdown = this.parseMarkdown.bind(this);
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
      highlight: (str, lang) => {
        if (lang && hljs.getLanguage(lang)) {
          try {
            return '<pre class="hljs"><code>' +
                    hljs.highlight(lang, str, true).value +
                    '</code></pre>';
          } catch (__) {}
        }

        return '<pre class="hljs"><code>' + this.md.utils.escapeHtml(str) + '</code></pre>';
      },
    });
  }

  /**
   * configure markdown-it plugins
   * @param {any} config
   */
  configurePlugins(config) {
    this.md
        .use(require('markdown-it-emoji'))
        .use(require('markdown-it-mathjax')());

    // integrate markdown-it-emoji and emojione
    this.md.renderer.rules.emoji = (token, idx) => {
      const shortname = `:${token[idx].markup}:`;
      return emojione.shortnameToImage(shortname);
    };
  }

  preProcess(markdown, dom) {
    for (let i = 0; i < this.preProcessors.length; i++) {
      if (!this.preProcessors[i].process) {
        continue;
      }
      markdown = this.preProcessors[i].process(markdown, dom);
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
