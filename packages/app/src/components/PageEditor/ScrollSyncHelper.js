/**
 * This class is copied from Microsoft/vscode repository
 * @see https://github.com/Microsoft/vscode/blob/0532a3429a18688a0c086a4212e7e5b4888b2a48/extensions/markdown/media/main.js
 */
class ScrollSyncHelper {

  /**
   * @typedef {{ element: Element, line: number }} CodeLineElement
   */

  getCodeLineElements(parentElement) {
    /** @type {CodeLineElement[]} */
    let elements;
    if (!elements) {
      elements = Array.prototype.map.call(
        parentElement.getElementsByClassName('code-line'),
        (element) => {
          const line = +element.getAttribute('data-line');
          return { element, line };
        },
      )
        .filter((x) => { return !Number.isNaN(x.line) });
    }
    return elements;
  }

  /**
   * Find the html elements that map to a specific target line in the editor.
   *
   * If an exact match, returns a single element. If the line is between elements,
   * returns the element prior to and the element after the given line.
   *
   * @param {Element} element
   * @param {number} targetLine
   *
   * @returns {{ previous: CodeLineElement, next?: CodeLineElement }}
   */
  getElementsForSourceLine(element, targetLine) {
    const lines = this.getCodeLineElements(element);
    let previous = lines[0] || null;
    for (const entry of lines) {
      if (entry.line === targetLine) {
        return { previous: entry, next: null };
      }
      if (entry.line > targetLine) {
        return { previous, next: entry };
      }
      previous = entry;
    }
    return { previous };
  }

  /**
   * Find the html elements that are at a specific pixel offset on the page.
   *
   * @param {Element} parentElement
   * @param {number} offset
   *
   * @returns {{ previous: CodeLineElement, next?: CodeLineElement }}
   */
  getLineElementsAtPageOffset(parentElement, offset) {
    const lines = this.getCodeLineElements(parentElement);

    const position = offset - parentElement.scrollTop + this.getParentElementOffset(parentElement);

    let lo = -1;
    let hi = lines.length - 1;
    while (lo + 1 < hi) {
      const mid = Math.floor((lo + hi) / 2);
      const bounds = lines[mid].element.getBoundingClientRect();
      if (bounds.top + bounds.height >= position) {
        hi = mid;
      }
      else {
        lo = mid;
      }
    }

    const hiElement = lines[hi];
    if (hi >= 1 && hiElement.element.getBoundingClientRect().top > position) {
      const loElement = lines[lo];
      const bounds = loElement.element.getBoundingClientRect();
      const previous = { element: loElement.element, line: loElement.line };
      if (bounds.height > 0) {
        previous.line += (position - bounds.top) / (bounds.height);
      }
      const next = { element: hiElement.element, line: hiElement.line, fractional: 0 };
      return { previous, next };
    }

    const bounds = hiElement.element.getBoundingClientRect();
    const previous = { element: hiElement.element, line: hiElement.line + (position - bounds.top) / (bounds.height) };
    return { previous };
  }

  getEditorLineNumberForPageOffset(parentElement, offset) {
    const { previous, next } = this.getLineElementsAtPageOffset(parentElement, offset);
    if (previous) {
      if (next) {
        const betweenProgress = (
          offset - parentElement.scrollTop - previous.element.getBoundingClientRect().top)
          / (next.element.getBoundingClientRect().top - previous.element.getBoundingClientRect().top);
        return previous.line + betweenProgress * (next.line - previous.line);
      }

      return previous.line;

    }
    return null;
  }

  /**
   * return the sum of the offset position of parent element and paddingTop
   * @param {Element} parentElement
   */
  getParentElementOffset(parentElement) {
    const offsetY = parentElement.getBoundingClientRect().top;
    // get paddingTop
    const style = window.getComputedStyle(parentElement, null);
    const paddingTop = +(style.paddingTop.replace('px', ''));

    return offsetY + paddingTop;
  }

  /**
   * Attempt to scroll preview element for a source line in the editor.
   *
   * @param {Element} previewElement
   * @param {number} line
   */
  scrollPreview(previewElement, line) {
    const { previous, next } = this.getElementsForSourceLine(previewElement, line);
    if (previous) {
      let scrollTo = 0;
      if (next) {
        // Between two elements. Go to percentage offset between them.
        const betweenProgress = (line - previous.line) / (next.line - previous.line);
        const elementOffset = next.element.getBoundingClientRect().top - previous.element.getBoundingClientRect().top;
        scrollTo = previous.element.getBoundingClientRect().top + betweenProgress * elementOffset;
      }
      else {
        scrollTo = previous.element.getBoundingClientRect().top;
      }

      scrollTo -= this.getParentElementOffset(previewElement);

      previewElement.scrollTop += scrollTo;
    }
  }

  /**
   * Attempt to reveal the element that is overflowing from previewElement.
   *
   * @param {Element} previewElement
   * @param {number} line
   */
  scrollPreviewToRevealOverflowing(previewElement, line) {
    // eslint-disable-next-line no-unused-vars
    const { previous, next } = this.getElementsForSourceLine(previewElement, line);
    if (previous) {
      const parentElementOffset = this.getParentElementOffset(previewElement);
      const prevElmTop = previous.element.getBoundingClientRect().top - parentElementOffset;
      const prevElmBottom = previous.element.getBoundingClientRect().bottom - parentElementOffset;

      let scrollTo = null;
      if (prevElmTop < 0) {
        // set the top of 'previous.element' to the top of 'previewElement'
        scrollTo = previewElement.scrollTop + prevElmTop;
      }
      else if (prevElmBottom > previewElement.clientHeight) {
        // set the bottom of 'previous.element' to the bottom of 'previewElement'
        scrollTo = previewElement.scrollTop + prevElmBottom - previewElement.clientHeight + 20;
      }

      if (scrollTo == null) {
        return;
      }

      previewElement.scrollTop = scrollTo;
    }
  }

  /**
   * Attempt to scroll Editor component for the offset of the element in the Preview component.
   *
   * @param {Editor} editor
   * @param {Element} previewElement
   * @param {number} offset
   */
  scrollEditor(editor, previewElement, offset) {
    let line = this.getEditorLineNumberForPageOffset(previewElement, offset);
    line = Math.floor(line);
    editor.setScrollTopByLine(line);
  }

}

// singleton pattern
const instance = new ScrollSyncHelper();
Object.freeze(instance);
export default instance;
