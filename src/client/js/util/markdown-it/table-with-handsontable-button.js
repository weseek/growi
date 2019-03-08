export default class TableWithHandsontableButtonConfigurer {

  constructor(crowi) {
    this.crowi = crowi;
  }

  configure(md) {
    md.renderer.rules.table_open = (tokens, idx) => {
      const beginLine = tokens[idx].map[0] + 1;
      const endLine = tokens[idx].map[1];
      // eslint-disable-next-line max-len
      return `<div class="editable-with-handsontable"><button class="handsontable-modal-trigger" onClick="crowi.launchHandsontableModal('page', ${beginLine}, ${endLine})"><i class="icon-note"></i></button><table class="table table-bordered">`;
    };

    md.renderer.rules.table_close = (tokens, idx) => {
      return '</table></div>';
    };
  }

}
