export default class TableConfigurer {

  constructor(crowi) {
    this.crowi = crowi;
  }

  configure(md) {
    md.renderer.rules.table_open = (tokens, idx) => {
      return '<div><button></button><table class="table table-bordered">';
    };

    md.renderer.rules.table_close = (tokens, idx) => {
      return '</table></div>';
    };
  }
}
