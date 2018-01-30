import MarkdownIt from 'markdown-it';
// import hljs from 'highlight.js';
import * as entities from 'entities';

import MarkdownFixer from './PreProcessor/MarkdownFixer';
import Linker        from './PreProcessor/Linker';
import ImageExpander from './PreProcessor/ImageExpander';
import XssFilter     from './PreProcessor/XssFilter';

import emoji         from 'markdown-it-emoji';
import Mathjax       from './PostProcessor/Mathjax';

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
      new ImageExpander(crowi),
      new XssFilter(crowi),
    ];
    this.postProcessors = [
      new Mathjax(crowi),
    ];

    this.langProcessors = {
      'tsv': new Tsv2Table(crowi),
      'tsv-h': new Tsv2Table(crowi, {header: true}),
      'template': new Template(crowi),
      'plantuml': new PlantUML(crowi),
    };

    this.configure = this.configure.bind(this);
    this.parseMarkdown = this.parseMarkdown.bind(this);
    this.codeRenderer = this.codeRenderer.bind(this);
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
    });
  }

  /**
   * configure markdown-it plugins
   * @param {any} config
   */
  configurePlugins(config) {
    this.md
        .use(emoji);

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

  codeRenderer(code, lang, escaped) {
    let result = '', hl;

    // if (lang) {
    //   const langAndFn = lang.split(':');
    //   const langPattern = langAndFn[0];
    //   const langFn = langAndFn[1] || null;
    //   if (this.langProcessors[langPattern]) {
    //     return this.langProcessors[langPattern].process(code, lang);
    //   }

    //   try {
    //     hl = hljs.highlight(langPattern, code);
    //     result = hl.value;
    //     escaped = true;
    //   } catch (e) {
    //     result = code;
    //   }

    //   result = (escape ? result : entities.encodeHTML(result));

    //   let citeTag = '';
    //   if (langFn) {
    //     citeTag = `<cite>${langFn}</cite>`;
    //   }
    //   return `<pre class="wiki-code wiki-lang">${citeTag}<code class="lang-${lang}">${result}\n</code></pre>\n`;
    // }

    // no lang specified
    return `<pre class="wiki-code"><code>${entities.encodeHTML(code)}\n</code></pre>`;

  }

  parseMarkdown(markdown, dom, markedOpts) {
    let parsed = '';

    /*
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
    */

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
