export default class TableConfigurer {

  configure(md) {
    md.renderer.rules.table_open = (tokens, idx) => {
      return '<table class="table table-bordered">';
    };
  }

}
