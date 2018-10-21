/**
 * Utility for Handsontable (and cooperation with MarkdownTable)
 */
export default class HandsontableUtil {

  static setClassNameToColumns(core, startCol, endCol, className) {
    for (let i = startCol; i <= endCol; i++) {
      for (let j = 0; j < core.countRows(); j++) {
        core.setCellMeta(j, i, 'className', className);
      }
    }
    core.render();
  }
}
