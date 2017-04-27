import marked from 'marked';
import hljs from 'highlight.js';

import MarkdownFixer from './PreProcessor/MarkdownFixer';
import Linker        from './PreProcessor/Linker';
import ImageExpander from './PreProcessor/ImageExpander';

import Emoji         from './PostProcessor/Emoji';

import Tsv2Table from './LangProcessor/Tsv2Table';
import Template from './LangProcessor/Template';

export default class CrowiRenderer {


  constructor(plugins) {

    this.preProcessors = [
      new MarkdownFixer(),
      new Linker(),
      new ImageExpander(),
    ];
    this.postProcessors = [
      new Emoji(),
    ];

    this.langProcessors = {
      'tsv': new Tsv2Table(),
      'tsv-h': new Tsv2Table({header: true}),
      'template': new Template(),
    };

    this.parseMarkdown = this.parseMarkdown.bind(this);
    this.codeRenderer = this.codeRenderer.bind(this);
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

  postProcess(html) {
    for (let i = 0; i < this.postProcessors.length; i++) {
      if (!this.postProcessors[i].process) {
        continue;
      }
      html = this.postProcessors[i].process(html);
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

      result = (escape ? result : Crowi.escape(result, true));

      let citeTag = '';
      if (langFn) {
        citeTag = `<cite>${langFn}</cite>`;
      }
      return `<pre class="wiki-code wiki-lang">${citeTag}<code class="lang-${lang}">${result}\n</code></pre>\n`;
    }

    // no lang specified
    return `<pre class="wiki-code"><code>${Crowi.escape(code, true)}\n</code></pre>`;

  }

  parseMarkdown(markdown) {
    let parsed = '';

    const markedRenderer = new marked.Renderer();
    markedRenderer.code = this.codeRenderer;

    try {
      // TODO
      marked.setOptions({
        gfm: true,
        tables: true,
        breaks: true,
        pedantic: false,
        sanitize: false,
        smartLists: true,
        smartypants: false,
        renderer: markedRenderer,
      });

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

  render(markdown) {
    let html = '';

    markdown = this.preProcess(markdown);
    html = this.parseMarkdown(markdown);
    html = this.postProcess(html);

    return html;
  }
}
