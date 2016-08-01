import marked from 'marked';
import hljs from 'highlight.js';

import MarkdownFixer from './PreProcessor/MarkdownFixer';
import Linker from './PreProcessor/Linker';
import ImageExpander from './PreProcessor/ImageExpander';

export default class CrowiRenderer {

  constructor(plugins) {
    this.preProcessors = [
      new MarkdownFixer(),
      new Linker(),
      new ImageExpander(),
    ];

    this.postProcessors = [
    ];
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

  parseMarkdown(markdown) {
    let parsed = '';

    try {
      // TODO
      marked.setOptions({
        gfm: true,
        highlight: function (code, lang) {
          let result, hl;
          if (lang) {
            try {
              hl = hljs.highlight(lang, code);
              result = hl.value;
            } catch (e) {
              result = code;
            }
          } else {
            result = code;
          }
          return result;
        },
        tables: true,
        breaks: true,
        pedantic: false,
        sanitize: false,
        smartLists: true,
        smartypants: false,
        langPrefix: 'lang-'
      });

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
