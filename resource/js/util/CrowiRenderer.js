/**
 * DEPRECATED
 * replaced by GrowiRenderer -- 2018.01.29 Yuki Takei
 *
import marked from 'marked';
import hljs from 'highlight.js';
import * as entities from 'entities';

import MarkdownFixer from './PreProcessor/MarkdownFixer';
import Linker        from './PreProcessor/Linker';
import ImageExpander from './PreProcessor/ImageExpander';
import XssFilter     from './PreProcessor/XssFilter';

import Emoji         from './PostProcessor/Emoji';
import Mathjax       from './PostProcessor/Mathjax';

import Tsv2Table from './LangProcessor/Tsv2Table';
import Template from './LangProcessor/Template';
import PlantUML from './LangProcessor/PlantUML';

export default class CrowiRenderer {

  constructor(crowi) {
    this.crowi = crowi;

    this.preProcessors = [
      new MarkdownFixer(crowi),
      new Linker(crowi),
      new ImageExpander(crowi),
      new XssFilter(crowi),
    ];
    this.postProcessors = [
      new Emoji(crowi),
      new Mathjax(crowi),
    ];

    this.langProcessors = {
      'tsv': new Tsv2Table(crowi),
      'tsv-h': new Tsv2Table(crowi, {header: true}),
      'template': new Template(crowi),
      'plantuml': new PlantUML(crowi),
    };

    this.parseMarkdown = this.parseMarkdown.bind(this);
    this.codeRenderer = this.codeRenderer.bind(this);
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

  codeRenderer(code, lang, escaped) {
    let result = '', hl;

    if (lang) {
      const langAndFn = lang.split(':');
      const langPattern = langAndFn[0];
      const langFn = langAndFn[1] || null;
      if (this.langProcessors[langPattern]) {
        return this.langProcessors[langPattern].process(code, lang);
      }

      try {
        hl = hljs.highlight(langPattern, code);
        result = hl.value;
        escaped = true;
      } catch (e) {
        result = code;
      }

      result = (escape ? result : entities.encodeHTML(result));

      let citeTag = '';
      if (langFn) {
        citeTag = `<cite>${langFn}</cite>`;
      }
      return `<pre class="wiki-code wiki-lang">${citeTag}<code class="lang-${lang}">${result}\n</code></pre>\n`;
    }

    // no lang specified
    return `<pre class="wiki-code"><code>${entities.encodeHTML(code)}\n</code></pre>`;

  }

  parseMarkdown(markdown, dom, markedOpts) {
    let parsed = '';

    const markedRenderer = new marked.Renderer();
    markedRenderer.code = this.codeRenderer;

    try {
      // concat
      let concatMarkedOpts = Object.assign({
        gfm: true,
        tables: true,
        breaks: true,
        pedantic: false,
        sanitize: false,
        smartLists: true,
        smartypants: false,
        renderer: markedRenderer,
      }, markedOpts);

      marked.setOptions(concatMarkedOpts);

      // override
      marked.Lexer.lex = function(src, options) {
        var lexer = new marked.Lexer(options);

        // this is maybe not an official way
        if (lexer.rules) {
          lexer.rules.fences = /^ *(`{3,}|~{3,})[ \.]*([^\r\n]+)? *\n([\s\S]*?)\s*\1 *(?:\n+|$)/;
        }

        return lexer.lex(src);
      };

      parsed = marked(markdown);
    } catch (e) { console.log(e, e.stack); }

    return parsed;
  }
  */

  /**
   * render
   *
   * @param {string} markdown
   * @param {object} options
   *  ex:
   *  ```
   *    {
   *      marked: {...} // marked options
   *    }
   *  ```
   * @returns
   *
   * @memberOf CrowiRenderer
   */
  /*
   DEPRECATED
   replaced by GrowiRenderer -- 2018.01.29 Yuki Takei

  render(markdown, dom) {
    let html = '';

    html = this.parseMarkdown(markdown, dom);
    html = this.postProcess(html, dom);

    return html;
  }
}
*/
