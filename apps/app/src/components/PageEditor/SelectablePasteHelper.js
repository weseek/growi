export const YOUTUBE_URL_REGEX = /youtube\.com/;
export const GOOGLE_SPREAD_SHEET_URL_REGEX = /docs\.google\.com\/spreadsheets\//;
export const GOOGLE_DOCS_URL_REGEX = /docs\.google\.com\/document\//;
export const GOOGLE_SLIDE_URL_REGEX = /docs\.google\.com\/presentation/;
export const CACOO_URL_REGEX = /cacoo\.com\/diagrams\//;

class SelectablePasteHelper {

  constructor() {
    this.isSelectablePaste = this.isSelectablePaste.bind(this);
  }

  /**
   * Is SelectablePastable from clipboard data
   */
  isSelectablePaste(editor, event) {
    const text = event.clipboardData.getData('text/plain');

    if (text.length === 0) {
      return false;
    }

    if (this.selectableMatch(text)) {
      return true;
    }

    return false;
  }

  selectableMatch(text) {
    const serviceRegexes = [
      YOUTUBE_URL_REGEX,
      GOOGLE_SPREAD_SHEET_URL_REGEX,
      GOOGLE_DOCS_URL_REGEX,
      GOOGLE_SLIDE_URL_REGEX,
      CACOO_URL_REGEX,
    ];

    return serviceRegexes.some((regex) => {
      return text.match(regex);
    });
  }

}

// singleton pattern
const instance = new SelectablePasteHelper();
Object.freeze(instance);
export default instance;
