/**
 * Utility for Handsontable
 */
class HandsontableUtil {
  static alignColumns(core, startCol, endCol, className) {
    for (let i = startCol; i <= endCol; i++) {
      for (let j = 0; j < core.countRows(); j++) {
        core.setCellMeta(j, i, 'className', className);
      }
    }
    core.render();
  }
}

// singleton pattern
const instance = new HandsontableUtil();
Object.freeze(instance);
export default instance;
