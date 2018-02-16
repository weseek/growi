/**
 * This class is copied from Microsoft/vscode repository
 * @see https://github.com/Microsoft/vscode/blob/0532a3429a18688a0c086a4212e7e5b4888b2a48/extensions/markdown/media/main.js
 */
class ScrollSyncHelper {

  /**
	 * @typedef {{ element: Element, line: number }} CodeLineElement
	 */

  constructor() {
  }

  getCodeLineElements(parentElement) {
    /** @type {CodeLineElement[]} */
    let elements;
    if (!elements) {
      elements = Array.prototype.map.call(
        parentElement.getElementsByClassName('code-line'),
        element => {
          const line = +element.getAttribute('data-line');
          return { element, line }
        })
        .filter(x => !isNaN(x.line));
    }
    return elements;
  }

  /**
	 * Find the html elements that map to a specific target line in the editor.
	 *
	 * If an exact match, returns a single element. If the line is between elements,
	 * returns the element prior to and the element after the given line.
	 *
   * @param {Element} parentElement
	 * @param {number} targetLine
	 *
	 * @returns {{ previous: CodeLineElement, next?: CodeLineElement }}
	 */
	getElementsForSourceLine(parentElement, targetLine) {
		const lines = this.getCodeLineElements(parentElement);
		let previous = lines[0] || null;
		for (const entry of lines) {
			if (entry.line === targetLine) {
				return { previous: entry, next: null };
			} else if (entry.line > targetLine) {
				return { previous, next: entry };
			}
			previous = entry;
		}
		return { previous };
  }

  getParentElementOffset(parentElement) {
    // get paddingTop
    const style = window.getComputedStyle(parentElement, null);
    const paddingTop = +(style.paddingTop.replace('px', ''));

		return paddingTop + parentElement.getBoundingClientRect().top;
  }

  /**
	 * Attempt to reveal the element for a source line in the editor.
	 *
   * @param {Element} element
	 * @param {number} line
	 */
	scrollToRevealSourceLine(element, line) {
		const { previous, next } = this.getElementsForSourceLine(element, line);
		// marker.update(previous && previous.element);
		if (previous) {
			let scrollTo = 0;
			if (next) {
				// Between two elements. Go to percentage offset between them.
				const betweenProgress = (line - previous.line) / (next.line - previous.line);
				const elementOffset = next.element.getBoundingClientRect().top - previous.element.getBoundingClientRect().top;
				scrollTo = previous.element.getBoundingClientRect().top + betweenProgress * elementOffset;
			} else {
				scrollTo = previous.element.getBoundingClientRect().top;
      }

      scrollTo -= this.getParentElementOffset(element);

      element.scroll(0, element.scrollTop + scrollTo);
		}
  }

  /**
	 * Attempt to reveal the element that is overflowing from parent element.
	 *
   * @param {Element} element
	 * @param {number} line
	 */
	scrollToRevealOverflowingSourceLine(element, line) {
		const { previous, next } = this.getElementsForSourceLine(element, line);
		// marker.update(previous && previous.element);
		if (previous) {
      const parentElementOffset = this.getParentElementOffset(element);
      const prevElmTop = previous.element.getBoundingClientRect().top - parentElementOffset;
      const prevElmBottom = previous.element.getBoundingClientRect().bottom - parentElementOffset;

      if (prevElmTop < 0) {
        // set the top of 'previous.element' to the top of 'element'
        const scrollTo = element.scrollTop + prevElmTop;
        element.scroll(0, scrollTo);
      }
      if (prevElmBottom > element.clientHeight) {
        // set the bottom of 'previous.element' to the bottom of 'element'
        const scrollTo = element.scrollTop + prevElmBottom - element.clientHeight + 20;
        element.scroll(0, scrollTo);
      }
		}
  }

}

// singleton pattern
const instance = new ScrollSyncHelper();
Object.freeze(instance);
export default instance;
