export default class TableConfigurer {

  constructor(crowi) {
    this.crowi = crowi;
  }

  configure(md) {
    md.renderer.rules.table_open = (tokens, idx) => {
      const beginLine = tokens[idx].map[0] + 1;
      const endLine  = tokens[idx].map[1];
      return `<div><button data-markdowntable-begin-line=${beginLine} data-markdown-table-end-line=${endLine}></button><table class="table table-bordered">`;
    };

    md.renderer.rules.table_close = (tokens, idx) => {
      return '</table></div>';
    };
  }
}
