import { sawCollapsedSpans } from 'codemirror/src/line/saw_special_spans';
import { getLine } from 'codemirror/src/line/utils_line';
import { heightAtLine, visualLineEndNo, visualLineNo } from 'codemirror/src/line/spans';
import { DisplayUpdate } from 'codemirror/src/display/update_display';
import { adjustView } from 'codemirror/src/display/view_tracking';

class UpdateDisplayUtil {
  /**
   * Transplant 'updateDisplayIfNeeded' method to fix weseek/growi#703
   *
   * @see https://github.com/weseek/growi/issues/703
   * @see https://github.com/codemirror/CodeMirror/blob/5.42.0/src/display/update_display.js#L125
   *
   * @param {CodeMirror} cm
   */
  static forceUpdateViewOffset(cm) {
    const doc = cm.doc;
    const display = cm.display;

    const update = new DisplayUpdate(cm, cm.getViewport());

    // Compute a suitable new viewport (from & to)
    const end = doc.first + doc.size;
    let from = Math.max(update.visible.from - cm.options.viewportMargin, doc.first);
    let to = Math.min(end, update.visible.to + cm.options.viewportMargin);
    if (display.viewFrom < from && from - display.viewFrom < 20) from = Math.max(doc.first, display.viewFrom);
    if (display.viewTo > to && display.viewTo - to < 20) to = Math.min(end, display.viewTo);
    if (sawCollapsedSpans) {
      from = visualLineNo(cm.doc, from);
      to = visualLineEndNo(cm.doc, to);
    }
    adjustView(cm, from, to);

    display.viewOffset = heightAtLine(getLine(doc, display.viewFrom));
  }
}


export default UpdateDisplayUtil;
