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

  /**
   * return a function(handsontable event handler) to adjust the handsontable alignment to the markdown table
   */
  static createHandlerToSynchronizeHandontableAlignWith(markdownTableAlign) {
    const mapping = {
      'r': 'htRight',
      'c': 'htCenter',
      'l': 'htLeft',
      '': ''
    };

    return function() {
      const align = markdownTableAlign;
      for (let i = 0; i < align.length; i++) {
        HandsontableUtil.setClassNameToColumns(this, i, i, mapping[align[i]]);
      }
    };
  }

  /**
   * return MarkdownTable alignment retrieved from Handsontable instance
   */
  static getMarkdownTableAlignmentFrom(handsontable) {
    const cellMetasAtFirstRow = handsontable.getCellMetaAtRow(0);
    const mapping = {
      'htRight': 'r',
      'htCenter': 'c',
      'htLeft': 'l',
      '': ''
    };

    let align = [];
    for (let i = 0; i < cellMetasAtFirstRow.length; i++) {
      align.push(mapping[cellMetasAtFirstRow[i].className]);
    }

    return align;
  }
}

