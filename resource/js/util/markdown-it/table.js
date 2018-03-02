export default class TableConfigurer {

  constructor(crowi) {
    this.crowi = crowi;
  }

  configure(md) {
    md.renderer.rules.table_open = (tokens, idx) => {
      return '<table class="table table-bordered">';
    };
  }

}
